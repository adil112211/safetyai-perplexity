const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Генерировать сертификат
router.post('/generate', async (req, res) => {
  try {
    const { resultId } = req.body;
    const userId = req.user.telegramId;

    // Получаем результат теста
    const { data: result, error: resultError } = await supabase
      .from('test_results')
      .select('*, tests(title), users(first_name, last_name)')
      .eq('id', resultId)
      .single();

    if (resultError || !result || result.score < 85) {
      return res.status(400).json({ error: 'Score too low for certificate' });
    }

    // Генерируем PDF сертификат
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    const certificateId = uuidv4().slice(0, 8).toUpperCase();
    const fileName = `cert-${certificateId}.pdf`;

    // Дизайн сертификата
    doc.fontSize(40).font('Helvetica-Bold').text('СЕРТИФИКАТ', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica').text('Об успешном завершении курса', { align: 'center' });
    
    doc.moveDown(2);
    
    doc.fontSize(12).text(`Выдан: ${result.users.first_name} ${result.users.last_name}`, { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(14).font('Helvetica-Bold').text(`за прохождение курса`, { align: 'center' });
    doc.fontSize(14).font('Helvetica-Bold').text(`"${result.tests.title}"`, { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(12).text(`Результат: ${result.score}%`, { align: 'center' });
    
    doc.moveDown(2);
    doc.fontSize(10).text(`Уникальный номер: ${certificateId}`, { align: 'center' });
    doc.fontSize(10).text(`Дата выдачи: ${new Date().toLocaleDateString('ru-RU')}`, { align: 'center' });

    // Сохраняем PDF во временный файл
    const tempPath = path.join('/tmp', fileName);
    const writeStream = fs.createWriteStream(tempPath);

    await new Promise((resolve, reject) => {
      doc.pipe(writeStream);
      doc.end();
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Загружаем в Supabase Storage
    const fileContent = fs.readFileSync(tempPath);
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('certificates')
      .upload(`${userId}/${fileName}`, fileContent, {
        contentType: 'application/pdf'
      });

    if (uploadError) throw uploadError;

    // Получаем публичный URL
    const { data: publicUrl } = supabase
      .storage
      .from('certificates')
      .getPublicUrl(`${userId}/${fileName}`);

    // Сохраняем информацию о сертификате в БД
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .insert([
        {
          user_id: userId,
          test_id: result.test_id,
          result_id: resultId,
          certificate_url: publicUrl.publicUrl,
          certificate_number: certificateId
        }
      ])
      .select()
      .single();

    if (certError) throw certError;

    // Удаляем временный файл
    fs.unlinkSync(tempPath);

    res.json({
      success: true,
      certificate: {
        id: certificate.id,
        url: publicUrl.publicUrl,
        number: certificateId,
        issuedAt: certificate.issued_at
      }
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить список сертификатов пользователя
router.get('/list', async (req, res) => {
  try {
    const userId = req.user.telegramId;

    const { data: certificates, error } = await supabase
      .from('certificates')
      .select('*, tests(title)')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    if (error) throw error;

    res.json({ certificates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Извлечение текста из DOCX файлов для анализа
"""

import zipfile
import xml.etree.ElementTree as ET
import os

def extract_text_from_docx(docx_path):
    """Извлекает текст из DOCX файла"""
    try:
        with zipfile.ZipFile(docx_path, 'r') as z:
            xml_content = z.read('word/document.xml')
        
        tree = ET.fromstring(xml_content)
        
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        paragraphs = []
        for paragraph in tree.findall('.//w:p', ns):
            texts = []
            for text in paragraph.findall('.//w:t', ns):
                if text.text:
                    texts.append(text.text)
            if texts:
                paragraphs.append(''.join(texts))
        
        return '\n'.join(paragraphs)
    except Exception as e:
        return f"Ошибка: {str(e)}"

files = [
    "Положение конференция.docx",
    "Ямалетдинов Карим_работа.docx",
    "Ямалетдинов_Карим_тезисы.docx",
    "Мышенков_Роман_работа.docx",
    "Мышенков_Роман_тезисы.docx"
]

base_path = r"c:\Users\Karim\Downloads\secops-global"

for filename in files:
    filepath = os.path.join(base_path, filename)
    if os.path.exists(filepath):
        print(f"\n{'='*60}")
        print(f"ФАЙЛ: {filename}")
        print(f"{'='*60}")
        text = extract_text_from_docx(filepath)
        print(text[:8000] if len(text) > 8000 else text)
        if len(text) > 8000:
            print(f"\n... [текст обрезан, всего {len(text)} символов] ...")
    else:
        print(f"\nФайл не найден: {filepath}")

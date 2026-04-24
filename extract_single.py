#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Извлечение текста из одного DOCX файла
"""

from docx import Document
import sys

def extract_text_from_docx(docx_path):
    try:
        doc = Document(docx_path)
        paragraphs = []
        for para in doc.paragraphs:
            if para.text.strip():
                paragraphs.append(para.text)
        return '\n'.join(paragraphs)
    except Exception as e:
        return f"Ошибка: {str(e)}"

if len(sys.argv) > 1:
    filepath = sys.argv[1]
    text = extract_text_from_docx(filepath)
    print(text)
else:
    print("Укажите путь к файлу")

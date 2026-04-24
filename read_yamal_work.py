#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

from docx import Document

doc = Document(r"c:\Users\Karim\Downloads\secops-global\Ямалетдинов Карим_работа.docx")
for i, para in enumerate(doc.paragraphs):
    if para.text.strip():
        print(f"{i}: {para.text}")

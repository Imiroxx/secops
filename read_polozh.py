#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from docx import Document

doc = Document(r"c:\Users\Karim\Downloads\secops-global\Положение конференция.docx")
for para in doc.paragraphs:
    if para.text.strip():
        print(para.text)

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            # Skip page number on cover page
            return
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header
        self.drawString(54, 750, "AI-Powered Personalized Interview Mentor — Project Report")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 742, letter[0]-54, 742)
        
        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 40, page_text)
        self.drawString(54, 40, "Prepared by Rohit R | Department of IT | SKCT")
        self.line(54, 52, letter[0]-54, 52)
        
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,
        bottomMargin=72
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=30,
        leading=36,
        textColor=colors.HexColor("#0f172a"),
        alignment=TA_CENTER,
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=16,
        leading=22,
        textColor=colors.HexColor("#475569"),
        alignment=TA_CENTER,
        spaceAfter=40
    )
    
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=26,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=18,
        spaceAfter=10,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=16,
        textColor=colors.HexColor("#334155"),
        spaceBefore=6,
        spaceAfter=8,
        alignment=TA_JUSTIFY
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=20,
        firstLineIndent=-10,
        spaceBefore=4,
        spaceAfter=4
    )

    meta_label_style = ParagraphStyle(
        'MetaLabel',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=16,
        textColor=colors.HexColor("#1e293b")
    )
    
    meta_val_style = ParagraphStyle(
        'MetaVal',
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=colors.HexColor("#475569")
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.white
    )

    table_body_style = ParagraphStyle(
        'TableBody',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155")
    )

    story = []

    # ================= COVER PAGE =================
    story.append(Spacer(1, 1.5 * inch))
    story.append(Paragraph("AI-POWERED PERSONALIZED INTERVIEW MENTOR", title_style))
    story.append(Paragraph("A Comprehensive Academic Project Report", subtitle_style))
    
    # Decorative line
    d_line = Table([[""]], colWidths=[letter[0]-108], rowHeights=[4])
    d_line.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#06b6d4")),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(d_line)
    story.append(Spacer(1, 0.5 * inch))

    # Candidate details box
    details_data = [
        [Paragraph("Candidate Name:", meta_label_style), Paragraph("Rohit R", meta_val_style)],
        [Paragraph("Department:", meta_label_style), Paragraph("Information Technology (IT)", meta_val_style)],
        [Paragraph("College:", meta_label_style), Paragraph("Sri Krishna College of Technology", meta_val_style)],
        [Paragraph("Academic Year:", meta_label_style), Paragraph("4th Year (Final Year)", meta_val_style)],
        [Paragraph("Project Title:", meta_label_style), Paragraph("AI-Powered Personalized Interview Mentor", meta_val_style)],
        [Paragraph("Technical Stack:", meta_label_style), Paragraph("React, TypeScript, FastAPI, MongoDB Atlas, ChromaDB, OpenAI", meta_val_style)]
    ]
    
    details_table = Table(details_data, colWidths=[2.2 * inch, 4.2 * inch])
    details_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#f1f5f9")),
    ]))
    
    # Wrap in a nice frame border
    outer_table = Table([[details_table]], colWidths=[6.4 * inch])
    outer_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#e2e8f0")),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('TOPPADDING', (0,0), (-1,-1), 15),
        ('BOTTOMPADDING', (0,0), (-1,-1), 15),
        ('LEFTPADDING', (0,0), (-1,-1), 15),
        ('RIGHTPADDING', (0,0), (-1,-1), 15),
    ]))
    
    story.append(outer_table)
    story.append(Spacer(1, 1.2 * inch))
    
    # Institution Footer
    story.append(Paragraph("<b>DEPARTMENT OF INFORMATION TECHNOLOGY</b>", ParagraphStyle('Dept', fontName='Helvetica-Bold', fontSize=12, alignment=TA_CENTER, textColor=colors.HexColor("#0f172a"))))
    story.append(Paragraph("SRI KRISHNA COLLEGE OF TECHNOLOGY, COIMBATORE", ParagraphStyle('Coll', fontName='Helvetica', fontSize=10, alignment=TA_CENTER, textColor=colors.HexColor("#475569"))))
    story.append(PageBreak())

    # ================= 1. INTRODUCTION =================
    story.append(Paragraph("1. Introduction", h1_style))
    story.append(Paragraph(
        "Job interviews remain one of the most critical and challenging milestones in a student's professional career. "
        "Despite the abundant availability of traditional learning resources—such as static books, online question banks, and video tutorials—candidates "
        "consistently struggle to obtain personalized, context-aware, and actionable mock round evaluations tailored to their actual experience. "
        "This project introduces the <b>AI-Powered Personalized Interview Mentor</b>, a modern SaaS platform built specifically to deliver structured, "
        "highly customized practice sessions by parsing a user's resume, assessing answers dynamically, and supplying actionable, real-time analytics.",
        body_style
    ))
    story.append(Paragraph("The platform addresses this educational challenge by providing:", body_style))
    story.append(Paragraph("• <b>Resume Integration:</b> Parses PDF or Word resumes using advanced text extraction to identify project domains, primary technical stacks, and leadership skills.", bullet_style))
    story.append(Paragraph("• <b>Adaptive AI Conversations:</b> Simulates HR, Technical, and System Design interviews where follow-up questions adapt organically to the candidate's previous response using OpenAI GPT models.", bullet_style))
    story.append(Paragraph("• <b>Multi-Modal Evaluation:</b> Scores candidate feedback on four unique axes (technical correctness, communication skills, confidence, and clarity) with comprehensive inline improvements.", bullet_style))
    story.append(Paragraph("• <b>Monaco Code Playground:</b> An integrated IDE allowing users to practice live coding questions with automated complexity analyses and syntax checks.", bullet_style))
    story.append(Paragraph("• <b>Voice & Emotion Signal Preparation:</b> Backend infrastructure designed to support facial emotion monitoring and voice tone analyses to build optimal mock presence.", bullet_style))

    # ================= 2. EXISTING SYSTEM =================
    story.append(Paragraph("2. Existing System", h1_style))
    story.append(Paragraph(
        "Traditional interview preparation relies heavily on static question lists, peer-to-peer mocking systems, or high-cost physical tutoring sessions. "
        "While peer mock portals provide conversational experience, their consistency and technical depth are highly variable. General-purpose AI models (like generic ChatGPT sessions) "
        "suffer from a lack of continuity, fail to track overall preparation readiness trends, and do not integrate in-browser coding platforms. "
        "The comparison table below details the current methodologies and their drawbacks:",
        body_style
    ))
    
    # Existing systems table
    ex_headers = [Paragraph("<b>Method</b>", table_header_style), Paragraph("<b>Description</b>", table_header_style), Paragraph("<b>Core Limitation</b>", table_header_style)]
    ex_rows = [
        [Paragraph("Static Banks (LeetCode/Gfg)", table_body_style), Paragraph("Curated codings and technical question banks.", table_body_style), Paragraph("No speech analysis, behavioral feedback, or resume personalization.", table_body_style)],
        [Paragraph("Mock Portals (Pramp/etc)", table_body_style), Paragraph("Connects peers for live video mock assessments.", table_body_style), Paragraph("Highly dependent on peer availability; inconsistent technical feedback.", table_body_style)],
        [Paragraph("Generic Chatbots", table_body_style), Paragraph("Conversing with raw ChatGPT or Claude endpoints.", table_body_style), Paragraph("No persistent database dashboard, ATS resume parsing, or session logs.", table_body_style)],
        [Paragraph("Resume Writing Services", table_body_style), Paragraph("Mentors manually reviewing PDF layouts.", table_body_style), Paragraph("Extremely expensive, slow turnaround time, and non-scalable.", table_body_style)]
    ]
    
    ex_table = Table([ex_headers] + ex_rows, colWidths=[1.8 * inch, 2.3 * inch, 2.3 * inch])
    ex_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(ex_table)
    story.append(Spacer(1, 0.15 * inch))

    # ================= 3. PROPOSED APPROACH =================
    story.append(Paragraph("3. Proposed Approach", h1_style))
    story.append(Paragraph(
        "The proposed system introduces an <b>AI-driven, resume-aware, adaptive interview coaching platform</b> that fully decouples from manual scheduling and relational DB storage. "
        "By migrating the entire operational storage layers into **MongoDB Cloud (Atlas)**, the system manages robust schemas for users, session logs, coding evaluations, and weak concept histories "
        "in a cloud-scalable document database. Our platform embeds a **Retrieval-Augmented Generation (RAG)** pipeline via a **ChromaDB vector store** which injects high-quality company interview databases into the LLM context "
        "to deliver highly accurate, hallucination-free follow-up queries.",
        body_style
    ))
    story.append(Paragraph("<b>Key Features of the Proposed Approach:</b>", h2_style))
    story.append(Paragraph("• <b>Cloud-Decoupled Mongo Repository:</b> Eliminates fragile SQLite file locks, upgrading the app into a full-scale cloud document datastore.", bullet_style))
    story.append(Paragraph("• <b>Semantically Grounded RAG:</b> Queries ChromaDB using Sentence-Transformers to inject contextual knowledge (such as Amazon Leadership Principles or Google coding guidelines) directly into the AI prompt.", bullet_style))
    story.append(Paragraph("• <b>Granular Skill Analytics:</b> Aggregates student feedback dynamically to hide placeholder scores for new accounts, only plotting visual performance curves once the candidate completes mock sessions.", bullet_style))

    # ================= 4. SYSTEM ARCHITECTURE (STACK) =================
    story.append(Paragraph("4. System Architecture & Tech Stack", h1_style))
    story.append(Paragraph(
        "The system follows a classic **Three-Tier Service-Oriented Architecture** designed to scale independently. "
        "The client layer interacts with our backend endpoints via secured REST APIs using JWT access tokens. "
        "The architecture details are listed below:",
        body_style
    ))

    # Tech stack table
    tech_headers = [Paragraph("<b>Layer</b>", table_header_style), Paragraph("<b>Technology Used</b>", table_header_style), Paragraph("<b>Architecture Purpose</b>", table_header_style)]
    tech_rows = [
        [Paragraph("Frontend Client", table_body_style), Paragraph("React 18, TypeScript, Vite, Tailwind CSS, Monaco Editor", table_body_style), Paragraph("Handles interactive layouts, code submissions, dynamic charts, and JWT sessions.", table_body_style)],
        [Paragraph("Backend Server", table_body_style), Paragraph("FastAPI (Python), Uvicorn", table_body_style), Paragraph("Exposes robust REST APIs with fully swappable LLM services (OpenAI vs Local Fallbacks).", table_body_style)],
        [Paragraph("Document Storage", table_body_style), Paragraph("MongoDB Atlas Cloud Storage", table_body_style), Paragraph("Serves as the primary operational database storing profiles, interview events, and logs.", table_body_style)],
        [Paragraph("Vector Memory", table_body_style), Paragraph("ChromaDB, Sentence-Transformers", table_body_style), Paragraph("Handles semantic chunk indexing and quick cosine-similarity vector searches.", table_body_style)],
        [Paragraph("AI Inference Layer", table_body_style), Paragraph("OpenAI GPT-4o-mini & custom heuristics", table_body_style), Paragraph("Evaluates transcripts, adjusts questions adaptively, and generates codes suggestions.", table_body_style)]
    ]
    
    tech_table = Table([tech_headers] + tech_rows, colWidths=[1.5 * inch, 2.4 * inch, 2.5 * inch])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 0.15 * inch))

    # ================= 5. WORKFLOW OF THE SYSTEM =================
    story.append(Paragraph("5. Workflow of the System", h1_style))
    story.append(Paragraph("The platform operates via a structured 5-stage student journey:", body_style))
    story.append(Paragraph("<b>1. Authentication & Onboarding:</b> Users sign up cleanly. Upon registration, they are cleanly redirected to the Sign-In tab with an instructions banner requiring manual verification to build optimal account security.", bullet_style))
    story.append(Paragraph("<b>2. Resume Parsing & Extraction:</b> The student uploads their PDF resume. PyPDF extracts the raw blocks, and the AI service automatically generates target mock concepts which populate their dashboard.", bullet_style))
    story.append(Paragraph("<b>3. Adaptive Session Initialization:</b> The candidate selects a target company and mode. The system retrieves vector contexts from ChromaDB and initializes an active mock session document inside MongoDB Atlas.", bullet_style))
    story.append(Paragraph("<b>4. Real-time Feedback Loop:</b> For each conversational turn, the AI assesses their answers across 4 unique criteria, saves intermediate state into the cloud, and serves an optimized next follow-up question.", bullet_style))
    story.append(Paragraph("<b>5. Metrics Integration:</b> Once the session is closed, the analytics dashboard unlocks, dynamically compiling weak concepts maps and performance radar charts to recommend tomorrow's revision plan.", bullet_style))

    # ================= 6. ADVANTAGES =================
    story.append(Paragraph("6. Advantages", h1_style))
    story.append(Paragraph("The platform introduces several key benefits for both students and university placement cells:", body_style))
    story.append(Paragraph("• <b>Absolute Personalization:</b> Generates technical and situational questions derived directly from the student's unique projects and skills rather than generic banks.", bullet_style))
    story.append(Paragraph("• <b>On-Demand Availability:</b> Replaces expensive mock platforms and peer dependency with an instant, always-available AI coach running 24/7.", bullet_style))
    story.append(Paragraph("• <b>Granular Onboarding UX:</b> Hides confusing placeholder graphs for new users, showing premium onboarding cards until actual practice data is loaded.", bullet_style))
    story.append(Paragraph("• <b>Cloud Scalability & Safety:</b> Decouples database locks through MongoDB Atlas Cloud, protecting student practice logs from local system crashes.", bullet_style))
    story.append(Paragraph("• <b>Integrated Monaco Playground:</b> Provides in-browser compilation and execution models, eliminating context-switching between tools.", bullet_style))
    
    # ================= 7. CONCLUSION =================
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph("7. Conclusion", h1_style))
    story.append(Paragraph(
        "The <b>AI-Powered Personalized Interview Mentor</b> represents a major step forward from rigid, non-interactive question repositories. "
        "By integrating advanced NLP models, semantic RAG matching, dynamic cloud persistence via MongoDB Atlas, and a fully polished user experience, the system "
        "equips IT students with the toolsets required to conquer competitive recruitment pipelines. The containerized, modular service layer ensures that the system "
        "can be seamlessly scaled into a production-grade SaaS for global placement organizations with zero architectural rewrite.",
        body_style
    ))
    
    story.append(Spacer(1, 0.4 * inch))
    story.append(Paragraph("<i>Report Prepared by:</i>", ParagraphStyle('PrepBy', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor("#0f172a"))))
    story.append(Paragraph("<b>Rohit R</b> (IT Department, 4th Year)<br/>Sri Krishna College of Technology, Coimbatore", ParagraphStyle('PrepDetails', fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor("#475569"))))

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)

if __name__ == '__main__':
    # Make sure output directories exist
    os.makedirs('d:/AI-powered personalized interview mentor/artifacts', exist_ok=True)
    os.makedirs('C:/Users/rohit/.gemini/antigravity/brain/c46a53ae-9283-4b51-8760-7e60d0e41476/artifacts', exist_ok=True)
    
    # Generate both outputs
    build_pdf('d:/AI-powered personalized interview mentor/artifacts/project_report.pdf')
    build_pdf('C:/Users/rohit/.gemini/antigravity/brain/c46a53ae-9283-4b51-8760-7e60d0e41476/artifacts/project_report.pdf')
    print("PDF reports generated successfully!")

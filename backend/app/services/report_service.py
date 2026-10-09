"""
SmartExport Service - Auto-generated reports with AI insights
"""
import io
import json
from datetime import datetime
from typing import Dict, Any
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class ReportService:
    """Generate professional PDF reports from query results"""
    
    def generate_report(self, query_result: Dict[str, Any]) -> bytes:
        """Generate a PDF report from query results"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch)
        styles = getSampleStyleSheet()
        elements = []
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle', parent=styles['Heading1'],
            fontSize=20, textColor=colors.HexColor('#1a365d'),
            spaceAfter=20
        )
        subtitle_style = ParagraphStyle(
            'CustomSubtitle', parent=styles['Heading2'],
            fontSize=14, textColor=colors.HexColor('#2d3748'),
            spaceAfter=10
        )
        body_style = ParagraphStyle(
            'CustomBody', parent=styles['Normal'],
            fontSize=10, spaceAfter=6
        )
        
        # Title
        elements.append(Paragraph("GeoQuery Pune — Analysis Report", title_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Query Info
        elements.append(Paragraph(f"<b>Query:</b> {query_result.get('original_query', 'N/A')}", body_style))
        elements.append(Paragraph(f"<b>Query ID:</b> {query_result.get('query_id', 'N/A')}", body_style))
        elements.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", body_style))
        elements.append(Paragraph(f"<b>Processing Time:</b> {query_result.get('processing_time_ms', 0)} ms", body_style))
        elements.append(Spacer(1, 0.3*inch))
        
        # Summary
        elements.append(Paragraph("Summary", subtitle_style))
        results = query_result.get("results", {})
        total = results.get("total_found", 0)
        
        summary_data = [
            ["Metric", "Value"],
            ["Total Detections", str(total)],
            ["Tiles Searched", str(results.get("tiles_searched", 0))],
            ["Models Used", "SkyCLIP + OWL-ViT"],
            ["Spatial Filter", json.dumps(query_result.get("spatial_filter_applied", {}))]
        ]
        
        summary_table = Table(summary_data, colWidths=[2*inch, 4*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a365d')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f7fafc')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # AI Insights
        elements.append(Paragraph("AI-Generated Insights", subtitle_style))
        insights = query_result.get("insights", "No insights available.")
        elements.append(Paragraph(insights, body_style))
        elements.append(Spacer(1, 0.3*inch))
        
        # Top Detections
        elements.append(Paragraph("Top Detections", subtitle_style))
        detections = results.get("detections", [])[:10]
        
        if detections:
            det_data = [["#", "Class", "Confidence", "Location", "Distance"]]
            for i, det in enumerate(detections):
                det_data.append([
                    str(i + 1),
                    det.get("detection_class", "N/A"),
                    f"{det.get('confidence', 0)*100:.1f}%",
                    f"{det.get('center_lat', 0):.6f}, {det.get('center_lon', 0):.6f}",
                    f"{det.get('distance_to_target', 'N/A')}"
                ])
            
            det_table = Table(det_data, colWidths=[0.4*inch, 1.5*inch, 1*inch, 2*inch, 1.1*inch])
            det_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f7fafc')]),
            ]))
            elements.append(det_table)
        
        elements.append(Spacer(1, 0.3*inch))
        
        # Methodology
        elements.append(Paragraph("Methodology", subtitle_style))
        methodology = """
        This report was generated using the GeoQuery Pune multimodal GeoAI engine. 
        The system uses:<br/>
        • <b>SkyCLIP</b> (CLIP fine-tuned on SkyScript dataset) for zero-shot satellite tile search<br/>
        • <b>OWL-ViT</b> for open-vocabulary object detection and grounding<br/>
        • <b>GeoPandas/Shapely</b> for spatial overlay and proximity analysis<br/>
        • <b>Gemini 2.0 Flash</b> for natural language query understanding<br/>
        • <b>OpenStreetMap</b> vector data for Pune municipality<br/>
        """
        elements.append(Paragraph(methodology, body_style))
        
        # Footer
        elements.append(Spacer(1, 0.5*inch))
        elements.append(Paragraph(
            "<i>Generated by GeoQuery Pune — Multimodal GeoAI Query Engine</i>",
            ParagraphStyle('Footer', parent=body_style, fontSize=8, textColor=colors.grey)
        ))
        
        doc.build(elements)
        buffer.seek(0)
        return buffer.read()

# Singleton
report_service = ReportService()

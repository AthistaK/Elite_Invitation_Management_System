import { Response } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { prisma } from '../config/prisma';
import { logActivity } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth';

export async function exportInvitations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const format = (req.query.format as string || 'csv').toLowerCase();
    const filter = (req.query.filter as string || 'all').toLowerCase();

    const whereClause: any = {};
    if (filter === 'pending') whereClause.status = 'PENDING';
    if (filter === 'accepted') whereClause.status = 'ACCEPTED';
    if (filter === 'rejected') whereClause.status = 'REJECTED';
    if (filter === 'important') whereClause.priority = 'IMPORTANT';

    const invitations = await prisma.invitation.findMany({
      where: whereClause,
      include: {
        uploadedBy: {
          select: { fullName: true, email: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    await logActivity(
      req.user!.id,
      'REPORT_EXPORTED',
      `Chairman exported invitation report (${filter.toUpperCase()} - ${format.toUpperCase()})`,
      'Report',
      undefined
    );

    if (format === 'csv') {
      let csvContent = 'ID,Organization / Family Name,Event Date,Priority,Role,Category,Status,Uploaded By,Remarks\n';
      invitations.forEach((inv) => {
        const org = `"${(inv.organizationFamilyName || '').replace(/"/g, '""')}"`;
        const dateStr = new Date(inv.date).toLocaleDateString();
        const remarks = `"${(inv.remarks || '').replace(/"/g, '""')}"`;
        const uploader = `"${(inv.uploadedBy?.fullName || '').replace(/"/g, '""')}"`;
        csvContent += `${inv.id},${org},${dateStr},${inv.priority},${inv.role},${inv.category},${inv.status},${uploader},${remarks}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=eims_invitations_${filter}_${Date.now()}.csv`);
      res.send(csvContent);
      return;
    }

    if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Invitations Report');

      worksheet.columns = [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Organization / Family Name', key: 'org', width: 32 },
        { header: 'Event Date', key: 'date', width: 15 },
        { header: 'Priority', key: 'priority', width: 12 },
        { header: 'Role', key: 'role', width: 12 },
        { header: 'Category', key: 'category', width: 12 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Uploaded By', key: 'uploader', width: 22 },
        { header: 'Remarks', key: 'remarks', width: 30 },
      ];

      // Style header row
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E40AF' }, // Royal Blue header
      };

      invitations.forEach((inv) => {
        worksheet.addRow({
          id: inv.id,
          org: inv.organizationFamilyName,
          date: new Date(inv.date).toLocaleDateString(),
          priority: inv.priority,
          role: inv.role,
          category: inv.category,
          status: inv.status,
          uploader: inv.uploadedBy?.fullName || 'N/A',
          remarks: inv.remarks || '',
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=eims_invitations_${filter}_${Date.now()}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
      return;
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 30 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=eims_invitations_${filter}_${Date.now()}.pdf`);
      doc.pipe(res);

      // Header
      doc.fillColor('#1E40AF').fontSize(20).text('ELITE INVITATION MANAGEMENT SYSTEM (EIMS)', { align: 'center' });
      doc.fontSize(14).fillColor('#475569').text(`Executive Report: ${filter.toUpperCase()} Invitations`, { align: 'center' });
      doc.moveDown(1);
      doc.fontSize(10).fillColor('#64748B').text(`Generated on: ${new Date().toLocaleString()} | Total Records: ${invitations.length}`);
      doc.moveDown(1);

      if (invitations.length === 0) {
        doc.fillColor('#000000').fontSize(12).text('No invitation records found for the selected filter.');
      } else {
        invitations.forEach((inv, index) => {
          doc.fillColor(inv.priority === 'IMPORTANT' ? '#DC2626' : '#1E40AF')
             .fontSize(12)
             .text(`${index + 1}. ${inv.organizationFamilyName} [${inv.priority}]`);
          
          doc.fillColor('#334155').fontSize(10)
             .text(`   Date: ${new Date(inv.date).toLocaleDateString()} | Status: ${inv.status} | Role: ${inv.role} | Category: ${inv.category}`)
             .text(`   Uploaded By: ${inv.uploadedBy?.fullName || 'N/A'}`)
             .text(`   Remarks: ${inv.remarks || 'None'}`);
          doc.moveDown(0.8);
        });
      }

      doc.end();
      return;
    }

    res.status(400).json({ error: 'Unsupported format. Permitted formats: csv, xlsx, pdf' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Export generation failed.' });
  }
}

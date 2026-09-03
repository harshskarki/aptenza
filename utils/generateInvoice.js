import { jsPDF } from 'jspdf'

export function generateInvoice({ userName, userEmail, plan, amount, paymentId, date }) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Colors
  const indigo = [79, 70, 229]
  const dark = [15, 23, 42]
  const gray = [107, 114, 128]
  const lightGray = [249, 250, 251]

  // Header background
  doc.setFillColor(...indigo)
  doc.rect(0, 0, pageWidth, 50, 'F')

  // Logo text
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Aptenza', 20, 28)

  // Tagline
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('AI-Powered Mock Interview Platform', 20, 38)

  // Invoice title on right
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', pageWidth - 20, 25, { align: 'right' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Date: ${date}`, pageWidth - 20, 35, { align: 'right' })

  // Invoice details box
  doc.setFillColor(...lightGray)
  doc.roundedRect(15, 60, pageWidth - 30, 40, 3, 3, 'F')

  doc.setTextColor(...dark)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('BILLED TO', 25, 72)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gray)
  doc.text(userName || 'Customer', 25, 80)
  doc.text(userEmail || '', 25, 87)

  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'bold')
  doc.text('PAYMENT ID', pageWidth - 100, 72)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...gray)
  doc.text(paymentId || 'N/A', pageWidth - 100, 80)

  // Table header
  doc.setFillColor(...indigo)
  doc.rect(15, 115, pageWidth - 30, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Description', 25, 123)
  doc.text('Plan', pageWidth - 100, 123)
  doc.text('Amount', pageWidth - 20, 123, { align: 'right' })

  // Table row
  doc.setFillColor(255, 255, 255)
  doc.rect(15, 127, pageWidth - 30, 14, 'F')
  doc.setTextColor(...dark)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Aptenza Subscription', 25, 136)
  doc.text(plan?.toUpperCase() || 'PRO', pageWidth - 100, 136)
  doc.text(`₹${(amount / 100).toFixed(2)}`, pageWidth - 20, 136, { align: 'right' })

  // Divider
  doc.setDrawColor(229, 231, 235)
  doc.line(15, 141, pageWidth - 15, 141)

  // Total
  doc.setFillColor(...lightGray)
  doc.rect(pageWidth - 85, 145, 70, 20, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...dark)
  doc.text('Total:', pageWidth - 80, 157)
  doc.setTextColor(...indigo)
  doc.text(`₹${(amount / 100).toFixed(2)}`, pageWidth - 20, 157, { align: 'right' })

  // Status badge
  doc.setFillColor(34, 197, 94)
  doc.roundedRect(15, 148, 35, 14, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('PAID', 32, 157, { align: 'center' })

  // Notes
  doc.setTextColor(...gray)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Thank you for using Aptenza! This is a computer-generated invoice.', 15, 185)
  doc.text('For support, contact: support@aptenza.io', 15, 192)

  // Footer
  doc.setFillColor(...indigo)
  doc.rect(0, 275, pageWidth, 22, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.text('aptenza.vercel.app  |  support@aptenza.io', pageWidth / 2, 287, { align: 'center' })

  return doc
}
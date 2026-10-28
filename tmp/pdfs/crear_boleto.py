from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from decimal import Decimal, ROUND_HALF_UP
from pypdf import PdfReader

out='output/pdf/boleto-compraventa-LDS988.pdf'
for name,file in [('Arial','Arial.ttf'),('Arial-Bold','Arial Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name,'/System/Library/Fonts/Supplemental/'+file))
pdfmetrics.registerFontFamily('Arial',normal='Arial',bold='Arial-Bold')
W,H=A4
c=canvas.Canvas(out,pagesize=A4)
c.setTitle('Boleto de compraventa y recibo de seña - LDS 988')
c.setAuthor('Nicolas Zuzek')
ink=HexColor('#17212b'); muted=HexColor('#56616d'); line=HexColor('#cbd1d6')
left=46; width=W-92
c.setFillColor(ink)
c.setFont('Arial-Bold',18)
c.drawString(left,H-58,'BOLETO DE COMPRAVENTA')
c.setFont('Arial',11)
c.drawString(left,H-77,'DE AUTOMOTOR Y RECIBO DE SEÑA')
c.setFont('Arial',10)
c.setFillColor(muted)
c.drawString(left,H-99,'Fecha del acuerdo: 15 de octubre de 2026')
c.setStrokeColor(line);c.line(left,H-111,W-left,H-111)
style=ParagraphStyle('body',fontName='Arial',fontSize=10.3,leading=14.6,textColor=ink,spaceAfter=0)
y=H-128

def p(text,gap=10):
    global y
    para=Paragraph(text,style)
    _,h=para.wrap(width,700)
    para.drawOn(c,left,y-h)
    y-=h+gap

p('Entre <b>Nicolas Zuzek, DNI 41.222.512</b>, en adelante el <b>VENDEDOR</b>, y <b>Ezequiel Giménez, DNI 48.056.839</b>, en adelante el <b>COMPRADOR</b>, se celebra el presente boleto sujeto a las siguientes condiciones:',12)
p('<b>1. Vehículo.</b> El VENDEDOR se obliga a vender y el COMPRADOR a comprar el automotor <b>Ford Fiesta Kinetic Design Titanium, año 2012, cinco puertas, motor 1.6 nafta, caja manual, dominio LDS 988</b>.')
p('<b>2. Precio.</b> El precio total de la compraventa se fija en <b>USD 9.000,00</b> (nueve mil dólares estadounidenses).')
p('<b>3. Seña recibida.</b> El VENDEDOR reconoce haber recibido el <b>15 de octubre de 2026</b> una transferencia de <b>ARS 100.000,00</b> (cien mil pesos argentinos), realizada por <b>Christian Gabriel Gimenez</b> desde Mercado Pago a la cuenta del VENDEDOR en Banco Santander, por cuenta y orden del COMPRADOR. Operación de Mercado Pago N.º <b>183345558149</b>. El COMPRADOR reconoce e imputa ese pago a esta compraventa.')
p('A la cotización convenida de <b>ARS 1.512,00 por USD 1,00</b>, la seña equivale a <b>USD 66,14</b> (sesenta y seis dólares estadounidenses con catorce centavos), redondeada a dos decimales. Se descuenta del precio y deja un <b>saldo de USD 8.933,86</b> (ocho mil novecientos treinta y tres dólares estadounidenses con ochenta y seis centavos). Este boleto sirve como recibo de la seña.')
p('<b>4. Plazo y cumplimiento.</b> Ambas partes se comprometen a concretar la operación dentro de <b>un mes calendario contado desde el 15 de octubre de 2026, con vencimiento el 15 de noviembre de 2026 inclusive</b>. Dentro de ese plazo coordinarán el pago del saldo en dólares estadounidenses, la entrega del vehículo, sus llaves y documentación, y la firma y presentación de la documentación necesaria para la transferencia registral. El saldo se abonará contra la entrega del vehículo y la firma de la documentación de transferencia.')
p('<b>5. Seña y facultad de arrepentimiento.</b> Las partes pactan expresamente la <b>facultad de arrepentirse</b>, conforme al artículo 1059 del Código Civil y Comercial de la Nación. <b>Si el COMPRADOR se arrepiente, pierde la seña de USD 66,14 en beneficio del VENDEDOR. Si el VENDEDOR se arrepiente, debe restituir al COMPRADOR el doble de la seña, es decir, USD 132,28</b> (ciento treinta y dos dólares estadounidenses con veintiocho centavos). Si la operación se concreta, la seña se imputa a cuenta del precio.')
p('<b>6. Conformidad.</b> Las partes prestan conformidad mediante la firma del presente instrumento. Este boleto documenta el acuerdo y la seña; la transmisión del dominio requiere la correspondiente inscripción registral.',0)

sig_top=y-16
assert sig_top>138, f'Insufficient signature space: {sig_top}'
# Blank signature areas allow placement of DocuSign signature and date fields.
sig_line=90
colw=(width-34)/2
for x,name,dni,role in [(left,'Nicolas Zuzek','41.222.512','VENDEDOR'),(left+colw+34,'Ezequiel Giménez','48.056.839','COMPRADOR')]:
    c.setStrokeColor(line);c.line(x,sig_line,x+colw,sig_line)
    c.setFillColor(ink);c.setFont('Arial-Bold',10);c.drawString(x,sig_line-15,name)
    c.setFont('Arial',9);c.drawString(x,sig_line-29,'DNI '+dni+'  |  '+role)
    c.setFillColor(muted);c.setFont('Arial',8.5);c.drawString(x,sig_line-44,'Fecha de firma: __________________')
c.setFillColor(muted);c.setFont('Arial',8);c.drawRightString(W-left,25,'1 / 1')
c.save()
r=PdfReader(out)
assert len(r.pages)==1
text=r.pages[0].extract_text()
for expected in ['LDS 988','66,14','8.933,86','15 de noviembre de 2026','183345558149','48.056.839','41.222.512']:
    assert expected in text,expected
assert (Decimal(100000)/Decimal(1512)).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)==Decimal('66.14')
print(out)
print('Verified: 1 page, key details and calculation. Signature area begins at',sig_top)

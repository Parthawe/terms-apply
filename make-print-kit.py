from pathlib import Path
import json, re, html
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader, PdfWriter

root=Path(__file__).resolve().parent
out=root/'output/pdf';out.mkdir(parents=True,exist_ok=True)
tmp=root/'tmp/pdfs';tmp.mkdir(parents=True,exist_ok=True)
data=json.loads((root/'assets/print-data.json').read_text())
ink=colors.HexColor('#283c45');rule=colors.HexColor('#aab0a7');paper=colors.HexColor('#f7f4eb')
body=ParagraphStyle('Body',fontName='Helvetica',fontSize=10,leading=14,textColor=ink)
small=ParagraphStyle('Small',parent=body,fontSize=8,leading=11)
heading=ParagraphStyle('Heading',parent=body,fontName='Times-Roman',fontSize=19,leading=22)
W,H=A4
c=canvas.Canvas(str(tmp/'components.pdf'),pagesize=A4)
c.setTitle('Terms Apply - printable tabletop kit')

def text(value):return html.escape(value).replace('’',"'").replace('“','"').replace('”','"')
def para(s,x,y,width,style=body):
    p=Paragraph(s,style);_,height=p.wrap(width,H);p.drawOn(c,x,y-height);return y-height
def page(title,sub):
    c.setFillColor(ink);c.setFont('Times-Roman',26);c.drawString(15*mm,H-20*mm,title)
    para(text(sub),15*mm,H-25*mm,180*mm,small)
    c.setStrokeColor(rule);c.line(15*mm,15*mm,W-15*mm,15*mm)
    c.setFont('Helvetica',8);c.drawString(15*mm,10*mm,'Terms Apply | Fictional scenarios | Original game prototype by Parth Pawar')
def card(i,title,label,paragraphs):
    col=i%2;row=i//2;x=15*mm+col*92*mm;y=H-45*mm-row*77*mm;w=86*mm;h=71*mm
    c.setFillColor(paper);c.setStrokeColor(rule);c.setDash(2,3);c.rect(x,y-h,w,h,fill=1);c.setDash()
    cy=para(text(label).upper(),x+5*mm,y-5*mm,w-10*mm,small)-3*mm
    cy=para(text(title),x+5*mm,cy,w-10*mm,heading)-3*mm
    for p in paragraphs:cy=para(p,x+5*mm,cy,w-10*mm,body)-2*mm
    if cy<y-h+3*mm:raise ValueError(f'Card overflow: {title}')

page('Terms Apply','Print at actual size. Board is 180 mm square. Use a six-sided die and two small objects as markers.')
positions=[(4,4),(4,3),(4,2),(4,1),(4,0),(3,0),(2,0),(1,0),(0,0),(0,1),(0,2),(0,3),(0,4),(1,4),(2,4),(3,4)]
size=36*mm;ox=15*mm;top=H-48*mm
palette={'blue':'#3c6672','red':'#a84331','olive':'#667445'}
for i,s in enumerate(data['spaces']):
    row,col=positions[i];x=ox+col*size;y=top-(row+1)*size
    c.setFillColor(paper);c.setStrokeColor(rule);c.rect(x,y,size,size,fill=1)
    service=next((a for a in data['services'] if a['id']==s.get('service')),None)
    if service:c.setFillColor(colors.HexColor(palette[service['color']]));c.rect(x,y+size-3*mm,size,3*mm,fill=1,stroke=0)
    c.setFillColor(ink);c.setFont('Courier',7);c.drawString(x+3*mm,y+size-8*mm,f'{i+1:02d}')
    para(text(s['name']),x+3*mm,y+size-12*mm,size-6*mm,ParagraphStyle('Cell',parent=body,fontName='Times-Roman',fontSize=11,leading=13))
    effect='Acquire: 1 time' if service else '+1 time' if s['kind']=='bonus' else 'Free source' if s['kind']=='source' else 'Free review' if s['kind']=='review' else '-1 time / memory'
    c.setFont('Helvetica',6.5);c.drawString(x+3*mm,y+4*mm,effect)
c.setFillColor(ink);x=ox+size+8*mm;y=top-size-15*mm
para('TERMS APPLY',x,y,90*mm,small);y-=18*mm
para('A little<br/>convenience.',x,y,90*mm,ParagraphStyle('BoardTitle',parent=body,fontName='Times-Roman',fontSize=32,leading=34));y-=34*mm
para('What do you gain?<br/>What do you still need to do?',x,y,90*mm,body);y-=18*mm
para('FOUR ROUNDS / SHARED WORKBENCH<br/><br/>Tasks. Sources. Open obligations.',x,y,90*mm,small)
c.showPage()
page('Service cards','Cut on dashed lines. Ownership is shared. Benefits and terms are printed together.')
for i,s in enumerate(data['services']):card(i,s['name'],'Acquire: 1 on space, 2 elsewhere',[text(s['benefit']),'<b>Term:</b> '+text(s['term']),'Once per turn. Memory acts automatically.'])
c.showPage()
page('Task cards','Use small objects to track work. Read both sources before submitting a conclusion.')
for i,t in enumerate(data['tasks']):card(i,t['title'],f"{t['work']} work marks / fictional task",[text(t['question']),'<b>Proposed answer:</b> '+text(t['claim']),f"Work: {'[ ] '*t['work']}<br/>Sources: [ ] [ ]<br/>Accept / Revise / Unknown"])
c.showPage()
sources=[(t,s) for t in data['tasks'] for s in t['sources']]
for start in [0,6]:
    page('Source cards','Keep each source beside its matching task. Mark inspection on the task card.')
    for i,(t,s) in enumerate(sources[start:start+6]):card(i,s[0],t['title'],[text(s[1])])
    c.showPage()
page('Counters and receipt','Cut out counters. Record one obligation per row. Bring a die and two player markers.')
for i in range(30):
    x=25*mm+(i%10)*17*mm;y=H-55*mm-(i//10)*17*mm
    c.setDash(2,2);c.setStrokeColor(rule);c.circle(x,y,6*mm);c.setDash();c.setFillColor(ink);c.setFont('Helvetica',10);c.drawCentredString(x,y-3,'1')
y=H-115*mm
para('Round: ______  Player: ______  Time: ______',15*mm,y,180*mm);y-=12*mm
para('Service / task / benefit / obligation / resolved',15*mm,y,180*mm,small);y-=9*mm
for i in range(9):c.setStrokeColor(rule);c.line(15*mm,y-i*12*mm,195*mm,y-i*12*mm)
c.showPage()
page('Answer key','Keep separate until a conclusion is submitted. The evidence defines the scope of each answer.')
y=H-45*mm
for t in data['tasks']:
    verdict='Not enough information' if t['answer']=='unknown' else t['answer'].capitalize()
    y=para(text(t['title'])+': '+verdict,15*mm,y,180*mm,heading)-3*mm
    y=para(text(t['resolution']),15*mm,y,180*mm)-10*mm
c.showPage();c.save()

rulebody=ParagraphStyle('RuleBody',parent=body,fontSize=9.3,leading=12)
styles={'h1':ParagraphStyle('h1',parent=body,fontName='Times-Roman',fontSize=26,leading=29,spaceAfter=14,keepWithNext=True),'h2':ParagraphStyle('h2',parent=body,fontName='Times-Roman',fontSize=17,leading=20,spaceBefore=12,spaceAfter=7,keepWithNext=True)}
story=[]
ruletext=re.sub(r'## Answer key\n.*?(?=## Playtest questions)', 'The facilitator answer key is included on its own sheet in this kit.\n\n', (root/'rules.md').read_text(), flags=re.S)
for line in ruletext.splitlines():
    if not line.strip():continue
    if line.startswith('|---'):continue
    if line.startswith('# '):story.append(Paragraph(text(line[2:]),styles['h1']))
    elif line.startswith('## '):story.append(Paragraph(text(line[3:]),styles['h2']))
    else:
        line=re.sub(r'\*\*(.*?)\*\*',r'<b>\1</b>',text(line))
        if line.startswith('|'):line=' / '.join(x.strip() for x in line.strip('|').split('|'))
        story.append(Paragraph(line,rulebody));story.append(Spacer(1,4))
def footer(c,doc):
    c.setFillColor(ink);c.setFont('Helvetica',8);c.drawString(15*mm,10*mm,'Terms Apply | Rulebook');c.drawRightString(W-15*mm,10*mm,str(doc.page))
SimpleDocTemplate(str(tmp/'rules.pdf'),pagesize=A4,rightMargin=18*mm,leftMargin=18*mm,topMargin=18*mm,bottomMargin=20*mm).build(story,onFirstPage=footer,onLaterPages=footer)
writer=PdfWriter()
for name in ['components.pdf','rules.pdf']:
    for p in PdfReader(tmp/name).pages:writer.add_page(p)
writer.add_metadata({'/Title':'Terms Apply - printable tabletop kit and rulebook','/Author':'Parth Pawar'})
with(out/'terms-apply-kit.pdf').open('wb')as f:writer.write(f)
print(f'Created {len(writer.pages)}-page printable kit and rulebook.')

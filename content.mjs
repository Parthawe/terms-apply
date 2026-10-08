export const services = [
 {id:'memory',name:'Memory desk',color:'blue',benefit:'Keeps your place through an interruption.',term:'On an interruption, check the saved task before continuing.',action:'Save your place'},
 {id:'writing',name:'Writing desk',color:'red',benefit:'Adds 3 work marks for 1 time.',term:'Check the generated claim. This uses 1 more time.',action:'Draft an answer'},
 {id:'recommend',name:'Recommendation desk',color:'olive',benefit:'Adds 3 work marks for 1 time.',term:'Inspect the suggested destination and choose its scope. This uses 1 time.',action:'Find a route'},
 {id:'schedule',name:'Scheduling desk',color:'blue',benefit:'Carries up to 2 unused time into your next turn.',term:'Choose what to carry. Time is moved, not created.',action:'Reserve 2 time'},
 {id:'companion',name:'Companion desk',color:'red',benefit:'Returns 1 time once per turn.',term:'Read how the reassurance was produced before using it.',action:'Ask for reassurance'},
];
export const tasks = [
 {id:'lamp',title:'Choose a lamp pairing',work:5,question:'Does shade A fit base B without another part?',claim:'The supplied pieces fit directly.',sources:[['Shade A','The opening is 28 mm wide.'],['Base B','The mount is 32 mm wide. No adapter is included.']],answer:'revise',resolution:'The parts do not fit directly. An adapter or a different pairing is needed.'},
 {id:'delivery',title:'Plan a delivery',work:5,question:'Can the parcel arrive by Friday using the listed service?',claim:'Friday delivery is confirmed.',sources:[['Dispatch note','The fictional parcel leaves on Thursday.'],['Service sheet','Delivery takes three working days. No express service is listed.']],answer:'revise',resolution:'The listed service cannot meet Friday. Change the service or the deadline.'},
 {id:'booking',title:'Confirm a booking',work:4,question:'Is the studio free at 2 pm on Tuesday?',claim:'The studio is available.',sources:[['Room calendar','Tuesday, 2 pm: no room booking.'],['Staff rota','Tuesday afternoon staffing has not been confirmed. A staff member is required.']],answer:'unknown',resolution:'The room is free, but required staffing is unknown. Availability is not confirmed.'},
 {id:'poster',title:'Prepare a poster file',work:4,question:'Does the supplied file meet the printer’s size and bleed requirements?',claim:'The file meets the listed requirements.',sources:[['Printer sheet','Required size: 210 × 297 mm. Required bleed: 3 mm on every edge.'],['File report','Document: 210 × 297 mm. Bleed: 3 mm on every edge.']],answer:'accept',resolution:'Both listed requirements are met. This check covers size and bleed only.'},
 {id:'pickup',title:'Choose a pickup window',work:4,question:'Can the collection happen between noon and 1 pm?',claim:'That pickup window is supported.',sources:[['Opening hours','Collection desk is open 10 am to 4 pm.'],['Order notice','The order is ready at 11 am. Collection does not require an appointment.']],answer:'accept',resolution:'The requested window is within opening hours and after the order is ready.'},
];
export const spaces = [
 {name:'Begin again',kind:'bonus',note:'A clear starting point returns 1 time.'},
 {name:'Memory desk',kind:'service',service:'memory'},
 {name:'A useful detour',kind:'bonus',note:'A relevant source returns 1 time.'},
 {name:'Writing desk',kind:'service',service:'writing'},
 {name:'An interruption',kind:'interrupt',note:'Lose 1 time unless the memory desk keeps your place.'},
 {name:'Check the source',kind:'source',note:'Inspect one unchecked source at no time cost.'},
 {name:'Recommendation desk',kind:'service',service:'recommend'},
 {name:'A quiet window',kind:'bonus',note:'An uninterrupted moment returns 1 time.'},
 {name:'Review the terms',kind:'review',note:'Resolve one open obligation at no time cost.'},
 {name:'Scheduling desk',kind:'service',service:'schedule'},
 {name:'Context switch',kind:'interrupt',note:'Lose 1 time unless the memory desk keeps your place.'},
 {name:'Companion desk',kind:'service',service:'companion'},
 {name:'Keep the evidence',kind:'source',note:'Inspect one unchecked source at no time cost.'},
 {name:'A loose end',kind:'review',note:'Resolve one open obligation at no time cost.'},
 {name:'A useful correction',kind:'bonus',note:'A clearer assumption returns 1 time.'},
 {name:'Return path',kind:'bonus',note:'A known next step returns 1 time.'},
];

import {marketNews,newsChecked,newsEdition} from './news.mjs';
export const supportsMarket=m=>m.rulesVersion==='quick-v2';
export function marketSnapshot(){return {newsDeck:structuredClone(marketNews),newsChecked,newsEdition};}
export function newsImpact(card,propertyCount=0){
 if(card.mechanic==='ipo')return {incoming:card.capital,outgoing:card.fee,net:card.capital-card.fee,explanation:`$${card.capital} capital in − $${card.fee} listing fees = $${card.capital-card.fee} net capital. Funding is not profit.`};
 if(card.mechanic==='portfolio-cost'){const cost=card.perStreet*Math.max(1,propertyCount);return {incoming:0,outgoing:cost,net:-cost,explanation:`$${card.perStreet} × ${Math.max(1,propertyCount)} ${propertyCount?'owned streets':'minimum unit'} = $${cost} recovery cost.`};}
 return {incoming:Math.max(0,card.amount),outgoing:Math.max(0,-card.amount),net:card.amount,explanation:card.effect};
}

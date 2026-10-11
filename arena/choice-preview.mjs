import {active,spaces,rent} from './game.mjs';

// Read-only explanations use the same rent calculation as the referee.
export function purchasePreview(match){
 const player=active(match),space=player.position,square=spaces[space];
 const bought=structuredClone(match);bought.properties[space].owner=player.model.id;
 const visitorRent=rent(bought,space);
 return {price:square.price,cashAfter:player.cash-square.price,cashKept:player.cash,visitorRent,payingVisits:Math.ceil(square.price/visitorRent),completesPair:visitorRent>square.rent};
}
export function buildingPreview(match,space){
 const built=structuredClone(match);built.properties[space].houses++;
 return {before:rent(match,space),after:rent(built,space)};
}

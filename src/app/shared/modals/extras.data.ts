import { IngredientDetail, OrderItem } from './order.model';

/**
 * A static collection of additional ingredients customers can add to their order.
 * Why: Centralizes pricing and metadata for extras to ensure consistent calculations.
 */
export const EXTRAS_LIST: OrderItem[] = [
    { id: '105', name: 'Kräutersauce', category: 'extras', price: 0, ingredients: [] },
    { id: '106', name: 'Knoblauchsauce', category: 'extras', price: 0, ingredients: [] },
    { id: '107', name: 'Chilisauce', category: 'extras', price: 0, ingredients: [] },
    { id: '108', name: 'Algerienne', category: 'extras', price: 0, ingredients: [] },
    { id: '109', name: 'Samourai', category: 'extras', price: 0, ingredients: [] },
    { id: '110', name: 'BigBurger', category: 'extras', price: 0, ingredients: [] },
    { id: '111', name: 'Barbecue', category: 'extras', price: 0, ingredients: [] },
    { id: '112', name: 'wenig Zwiebeln', category: 'extras', price: 0, ingredients: [] },
    { id: '113', name: 'wenig Rotkraut', category: 'extras', price: 0, ingredients: [] },
    { id: '114', name: 'wenig Weißkraut', category: 'extras', price: 0, ingredients: [] },
    { id: '115', name: 'wenig Salat', category: 'extras', price: 0, ingredients: [] },
    { id: '100', name: 'Extra Fleisch', category: 'extras', price: 1.5, ingredients: [] },
    { id: '101', name: 'Extra Gemüse', category: 'extras', price: 1.0, ingredients: [] },
    { id: '102', name: 'Extra Käse', category: 'extras', price: 1.0, ingredients: [] },
    { id: '103', name: 'Extra Soße', category: 'extras', price: 1.0, ingredients: [] },
    { id: '104', name: 'Scharf', category: 'extras', price: 0.5, ingredients: [] },
];

export const SAUCE_INFO_LIST: IngredientDetail[] = [
    { id: 'algerienne', name: 'Algerienne', detail: 'ist pikant, würzig und leichter Schärfe durch Chili und Gewürze.' },
    { id: 'samourai', name: 'Samourai', detail: 'sehr scharfe Sauce auf Basis von Mayonnaise, Senf und roten Chili.' },
    { id: 'bigburger', name: 'BigBurger', detail: 'Sauce aus mischung von Mayonnaise, Ketchup, Senf, Gewürzen, Zwiebeln und Gewürzgurken.' },
    { id: 'barbecue', name: 'Barbecue', detail: 'hat einen rauchig und intensiv würzigen Geschmack.' },
    { id: 'tartare', name: 'Tartare', detail: 'basierend auf Mayonnaise, die typischerweise mit gehackten Gewürzgurken und frischen Kräutern sowie Petersilie verfeinert wird.' },
];

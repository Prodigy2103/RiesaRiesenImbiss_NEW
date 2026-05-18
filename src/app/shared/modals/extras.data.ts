import { IngredientDetail, OrderItem } from './order.model';

/**
 * A static collection of additional ingredients customers can add to their order.
 * Why: Centralizes pricing and metadata for extras to ensure consistent calculations.
 */
export const EXTRAS_LIST: OrderItem[] = [
    { id: '100', name: 'Kräutersauce', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '101', name: 'Knoblauchsauce', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '102', name: 'Chilisauce', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '103', name: 'Algerienne', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '104', name: 'Samourai', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '105', name: 'BigBurger', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '106', name: 'Barbecue', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '107', name: 'Tartare', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '108', name: 'Zaziki', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '109', name: 'Hollandaise Nr. 54, 55, 56', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '110', name: 'Sahnesauce Nr. 54, 55, 56', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '111', name: 'Kalbfleisch', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '112', name: 'Hähnchenfleisch', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '113', name: 'Fleisch gemischt', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '114', name: 'wenig Zwiebeln', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '115', name: 'wenig Rotkraut', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '116', name: 'wenig Salat', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '117', name: 'wenig Eisbergsalat', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '118', name: 'ohne Zwiebeln', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '119', name: 'ohne Rotkraut', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '120', name: 'ohne Salat', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '121', name: 'ohne Eisbergsalat', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '122', name: 'ohne Tomaten', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '123', name: 'ohne Gurken', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '124', name: 'Oliven', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '125', name: 'ohne Oliven', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '126', name: 'Extra Grillkäse', category: 'extras', price: 1.5, ingredients: [], amount: 1 },
    { id: '127', name: 'Extra gebr. Gemüse', category: 'extras', price: 1.0, ingredients: [], amount: 1 },
    { id: '128', name: 'Extra Soße', category: 'extras', price: 1.0, ingredients: [], amount: 1 },
    { id: '129', name: 'Extra Käse', category: 'extras', price: 1.0, ingredients: [], amount: 1 },
    { id: '130', name: 'Ketchup', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '131', name: 'Mayonaise', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '132', name: 'Ketchup & Mayonaise', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '133', name: 'ohne Champignons', category: 'extras', price: 0, ingredients: [], amount: 1 },
    { id: '134', name: 'ohne Brokkoli', category: 'extras', price: 0, ingredients: [], amount: 1 },
];

export const SAUCE_INFO_LIST: IngredientDetail[] = [
    { id: 'algerienne', name: 'Algerienne', detail: 'ist pikant, würzig und leichter Schärfe durch Chili und Gewürze.' },
    { id: 'samourai', name: 'Samourai', detail: 'sehr scharfe Sauce auf Basis von Mayonnaise, Senf und roten Chili.' },
    { id: 'bigburger', name: 'BigBurger', detail: 'Sauce aus mischung von Mayonnaise, Ketchup, Senf, Gewürzen, Zwiebeln und Gewürzgurken.' },
    { id: 'barbecue', name: 'Barbecue', detail: 'hat einen rauchig und intensiv würzigen Geschmack.' },
    { id: 'tartare', name: 'Tartare', detail: 'basierend auf Mayonnaise, die typischerweise mit gehackten Gewürzgurken und frischen Kräutern sowie Petersilie verfeinert wird.' },
];

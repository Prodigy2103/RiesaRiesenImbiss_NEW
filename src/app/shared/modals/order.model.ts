import { Timestamp } from '@angular/fire/firestore';

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'delivery' | 'completed' | 'done';

/**
 * Defines the structure for product categories.
 * Why: Used for dynamic rendering of the menu and filtering logic.
 */
export interface Category {
    id: string;
    key: string;
    label: string;
    img: string;
    description: string;
    order?: number;
}

/**
 * Represents a single menu item or product.
 * Why: Core interface for the shopping cart and product lists.
 */
export interface OrderItem {
    id: string;
    name: string;
    category: string;
    price: number;
    imgPath?: string;
    quantity?: number;
    // KORREKTUR: Hier müssen Objekte erlaubt sein, damit CartItem kompatibel ist
    ingredients?: (string | number)[]; 
    selectedExtras?: OrderItem[]; 
}

/**
 * Contains essential customer information for delivery.
 * Why: Needed for order processing and contacting the user.
 */
export interface CustomerData {
    name: string;
    address: string;
    phone: string;
    scheduledTime?: string;
}

export interface IngredientDetail {
    id: number | string;
    name: string;
    detail: string;
    composition?: string;
}

export interface Order {
    id: string; 
    status: OrderStatus;
    customer: CustomerData;
    items: OrderItem[];
    finalTotal: number;
    deliveryType: 'delivery' | 'pickup';
    createdAt: Timestamp; 
    notes?: string;
    
    // --- Neue Felder für den Kassenbon ---
    orderNumber?: string;       // z.B. #FQgC
    invoiceNumber?: string;     // Rechnungsnummer für das Finanzamt
    
    // Fiskaldaten (TSE)
    tseData?: {
        serial: string;
        signature: string;
        transactionId: number;
        processData: string;
        processType: string;
        signatureCounter: number;
        startDate: string;      // Oder Timestamp
        endDate: string;        // Oder Timestamp
    };
    
    qrCodeData?: string;        // Der String für den fiskalischen QR-Code
}
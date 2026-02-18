-- Insert income record for Jose Seethathod
INSERT INTO transactions (type, category, amount, description, date, payment_method)
VALUES (
    'income', 
    'Consultation Fee', -- Default category, change if needed
    5000, 
    'Jose Seethathod', 
    CURRENT_DATE, 
    'Cash' -- Default payment method
);

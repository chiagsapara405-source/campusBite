-- Run after database/foods.sql in the campusbite database.
INSERT INTO foods (name, description, category, price, image, vegetarian, available) VALUES
('Veg Cheese Burger', 'Crispy vegetable patty with cheese and fresh salad.', 'Burgers', 80.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80', TRUE, TRUE),
('Paneer Wrap', 'Spiced paneer with crunchy vegetables in a soft wrap.', 'Meals', 70.00, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=700&q=80', TRUE, TRUE),
('Margherita Pizza', 'Tomato, mozzarella and basil on a crisp base.', 'Pizza', 120.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80', TRUE, TRUE),
('Masala Dosa', 'Golden dosa with potato masala and chutneys.', 'Breakfast', 60.00, 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=700&q=80', TRUE, TRUE),
('Cold Coffee', 'Chilled, creamy coffee with a cocoa dusting.', 'Drinks', 50.00, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=700&q=80', TRUE, TRUE),
('Chicken Burger', 'Grilled chicken with lettuce and signature sauce.', 'Burgers', 110.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80', FALSE, FALSE),
('Chocolate Brownie', 'Fudgy chocolate brownie, baked fresh today.', 'Desserts', 65.00, NULL, TRUE, TRUE);

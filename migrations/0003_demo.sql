-- Synthetic records: all product cards explicitly marked DEMO. No real customer data.
INSERT INTO users(id,email,password_hash,role,name,email_verified_at) VALUES
('demo-consumer','demo-consumer@invalid.example','disabled','consumer','Demo consumer',CURRENT_TIMESTAMP),
('demo-maker','demo-maker@invalid.example','disabled','manufacturer','Demo manufacturer',CURRENT_TIMESTAMP);
INSERT INTO products(id,owner_id,title,description,category,status,demo,group_id,intelligence) VALUES
('demo-a1','demo-consumer','Eight-input portable audio interface','Creators request eight inputs, onboard DSP, dual USB-C connectivity and a target price below $250. These are proposed needs, not verified feasibility.','Creator tools','prototype',1,'demo-a1','{"title":"Portable eight-input audio interface","requirements":["Eight inputs","Onboard DSP","Dual USB-C","Target price under $250"],"questions":["What simultaneous sample rate is needed?","What power source is acceptable?"],"assumptions":["Target price is an aspiration, not a manufacturing estimate"],"complexity":"high","uncertainty":"Engineering and market feasibility have not been validated"}'),
('demo-a2','demo-consumer','Mobile multichannel recording interface','A second creator needs eight inputs and a portable interface with low latency monitoring.','Creator tools','idea',1,'demo-a1',NULL),
('demo-b','demo-consumer','Wireless earbuds with battery drain','Hypothetical wireless earbuds used to demonstrate repeated battery complaints and a revision workflow.','Audio','improvement',1,'demo-b',NULL),
('demo-c','demo-consumer','Smart-home hub with unreliable connections','Hypothetical home hub used to demonstrate reliability investigation and a human retirement decision.','Home','launch',1,'demo-c',NULL);
INSERT INTO support(user_id,product_id,kind,price) VALUES('demo-consumer','demo-a1','intent',250),('demo-maker','demo-a1','interest',NULL),('demo-consumer','demo-a2','interest',NULL);
INSERT INTO offers(id,product_id,manufacturer_id,price,currency,minimum_quantity,terms,eligible) VALUES('demo-offer-a','demo-a1','demo-maker',249.00,'USD',100,'DEMO proposal only. No physical fulfillment or actual preorder is offered.',0);
INSERT INTO feedback(id,product_id,user_id,version,kind,details,rating) VALUES
('demo-bf1','demo-b','demo-consumer','1.0','failure','Left earbud loses charge overnight after normal use.',2),
('demo-bf2','demo-b','demo-maker','1.0','failure','Battery drains while stored in the case.',2),
('demo-bf3','demo-b','demo-consumer','1.0','failure','Charge falls rapidly during standby.',1),
('demo-cf1','demo-c','demo-consumer','1.0','failure','Hub drops device connections repeatedly.',2),
('demo-cf2','demo-c','demo-maker','1.0','failure','Automations fail after connectivity loss.',1),
('demo-cf3','demo-c','demo-consumer','1.1','failure','Latest version still disconnects.',2),
('demo-cf4','demo-c','demo-maker','1.1','safety','Unreliable control of a connected safety device requires investigation.',1);
INSERT INTO alerts(id,product_id,kind,severity,evidence_count) VALUES('demo-alert-b','demo-b','failure','review',3),('demo-alert-c','demo-c','safety','high',1);
INSERT INTO recommendations(id,product_id,kind,severity,evidence,uncertainty,action,status,reviewed_by,reviewed_at) VALUES
('demo-rec-b','demo-b','IMPROVE','review','Three DEMO battery failure reports for version 1.0.','Reports are synthetic and do not establish a defect rate.','Investigate standby power draw and revise the battery management design.','accepted','demo-maker',CURRENT_TIMESTAMP),
('demo-rec-c','demo-c','INVESTIGATE / CONSIDER PAUSE','high','Four DEMO reliability reports across 1.0 and 1.1, including one safety concern.','Synthetic reports; no verified sales denominator or real safety assessment.','Review safety report, investigate disconnections, then decide whether to revise, pause or retire.','investigating','demo-maker',CURRENT_TIMESTAMP);
INSERT INTO events(id,product_id,actor_id,from_status,to_status,note) VALUES
('demo-ae1','demo-a1','demo-maker','idea','validation','DEMO: similar creator needs grouped for review.'),
('demo-ae2','demo-a1','demo-maker','validation','manufacturer_interest','DEMO: manufacturer submitted a preliminary offer.'),
('demo-ae3','demo-a1','demo-maker','manufacturer_interest','prototype','DEMO: prototype planning recorded; hardware feasibility unverified.'),
('demo-be1','demo-b','demo-maker','launch','improvement','DEMO: manufacturer accepted battery investigation and revision.'),
('demo-ce1','demo-c','demo-maker','testing','launch','DEMO: hypothetical initial launch.'),
('demo-ce2','demo-c','demo-maker','launch','launch','DEMO: manufacturer reviewing evidence; no retirement decision made.');

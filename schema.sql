DROP TABLE IF EXISTS locations;
CREATE TABLE IF NOT EXISTS locations( 
  search_query VARCHAR(255), 
  formatted_query VARCHAR(255), 
  latitude NUMERIC(20,14), 
  longitude NUMERIC(20,14) ,
  unique(search_query,formatted_query,latitude,longitude)
  );
const pool = require("../database")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

async function getVehicleById(vehicle_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.inv_id = $1`,
      [vehicle_id]
    )
    return data.rows
  }
  catch (error) {
    console.error("getVehicleById error " + error)
  }
}

 async function getInventoryDatabaseTables(){
  const data = await pool.query("SELECT * FROM information_schema.tables WHERE table_schema = 'public'")
  let invTables = []
  for (let i = 0; i < data.rows.length; i++) {
    if (data.rows[i].table_name === "inventory") {
      invTables.push(data.rows[i])
    }
    if (data.rows[i].table_name === "classification") {
      invTables.push(data.rows[i])
    }
  }
  return invTables
}

 async function addClassification(classification_name){
  try {
    const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

 async function checkClassificationExists(classification_name) 
{
  try {
    const sql = "SELECT * FROM public.classification WHERE classification_name ~* $1"
    const data = await pool.query(sql, [classification_name])
    return data.rowCount
  } catch (error){
   return error.message
  }
}

async function addInventory(inv_make, inv_model, inv_color, inv_price, classification_id,inv_miles,inv_description,inv_year){
  try {
    const inv_thumbnail = "/images/vehicles/no-image-tn.png"
    const inv_image = "/images/vehicles/no-image.png"
    const sql = "INSERT INTO public.inventory (inv_make, inv_model, inv_color, inv_price, classification_id, inv_thumbnail, inv_image, inv_miles, inv_description, inv_year) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *"
    return await pool.query(sql, [inv_make, inv_model, inv_color, inv_price, classification_id, inv_thumbnail, inv_image, inv_miles, inv_description, inv_year])
  } catch (error) {
    return error.message
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, getInventoryDatabaseTables, checkClassificationExists,addClassification,addInventory}

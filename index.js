import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';

const app = express();
const port = 3000;

const db = new pg.Client({
  user: 'postgres',
  password: 'jesus',
  host: 'localhost',
  database: 'permalist',
  port: 5433
})
db.connect()


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = await getItems() || [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

async function getItems() {
  const todos = await db.query(`select * from items`)
  return todos.rows
}

app.get("/", (req, res) => {
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  await db.query(`insert into items (title) values ($1)`, [item])
  items.push({ title: item });
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const id = req.body.updatedItemId
  const item = req.body.updatedItemTitle
  await db.query(`update items set title = $1 where items.id = $2`, [item, Number(id)])
  items = await getItems();
  res.redirect('/')
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId
  await db.query(`delete from items where items.id = $1`, [id])
  items = await getItems()
  res.redirect('/')
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

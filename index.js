const express = require("express");
const app = express();
const router = express.Router();

app.use(express.static("public"));

app.use('/', router);

  //Express error handling middleware
app.use((req, res) => {
    res.type("text/plain");
    res.status(404);
    res.send("Error no page found");
  });
 
  
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
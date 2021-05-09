'use strict';

const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const express = require('express');
const db = require('./src/db');
const swaggerDocument = require('./swagger/swagger.json');

const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.status(200).end(null);
});

app.get('/paragraph/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const paragraph = await db.Paragraph.findOne({
      where: {
        name: slug
      }
    });

    if (paragraph) {
      res.status(200).json({
        complete: paragraph.complete,
        sentences: paragraph.sentences,
      });
    } else {
      res.status(404).end();
    }
  } catch (e) {
    res.status(400).end(e.message);
  }
});

app.post('/paragraph/:slug', async (req, res) => {
  const { slug } = req.params;
  const { numSentences } = req.body;

  try {
    const paragraph = await db.Paragraph.create({ name: slug, numSentences });
    paragraph.sentences = Array.from({ length: numSentences }, _ => null);
    await paragraph.save();

    res.status(200).json({
      complete: paragraph.complete,
      sentences: paragraph.sentences,
    });
  } catch (e) {
    res.status(400).end(e.message);
  }
});

app.delete('/paragraph/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const paragraph = await db.Paragraph.destroy({
      where: {
        name: slug
      },
    });

    if (paragraph) {
      res.status(200).end();
    } else {
      res.status(404).end();
    }
  } catch (e) {
    res.status(400).end(e.message);
  }
});

app.post('/paragraph/:slug/sentence/:id', async (req, res) => {
  const { slug, id } = req.params;
  const { sentence } = req.body;

  try {
    const paragraph = await db.Paragraph.findOne({
      where: {
        name: slug
      }
    });

    if (!paragraph) {
      res.status(404).end();
    } else if (paragraph.numSentences < parseInt(id) + 1) {
      res.status(400).end();
    } else {
      const sentences = [...paragraph.sentences];
      sentences[parseInt(id)] = sentence;
      paragraph.sentences = sentences;
      if (paragraph.numSentences === sentences.filter(s => !!s).length) {
        paragraph.complete = true;
      }

      await paragraph.save();
      res.status(200).json({
        complete: paragraph.complete,
        sentences: paragraph.sentences,
      });
    }
  } catch (e) {
    res.status(400).end(e.message);
  }
});

app.delete('/paragraph/:slug/sentence/:id', async (req, res) => {
  const { slug, id } = req.params;

  try {
    const paragraph = await db.Paragraph.findOne({
      where: {
        name: slug
      }
    });

    const sentences = [...paragraph.sentences];
    sentences[parseInt(id)] = null;
    paragraph.sentences = sentences;
    paragraph.complete = false;
    await paragraph.save();

    res.status(200).end();
  } catch (e) {
    res.status(400).end();
  }
});

const alterDatabaseOnSync = true;
const eraseDatabaseOnSync = true;
db.sequelize
  .sync({
    force: eraseDatabaseOnSync,
    alter: alterDatabaseOnSync
  })
  .then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
    });
  });

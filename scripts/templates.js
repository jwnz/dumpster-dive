const dumpster = require('../src')

const path = '/Users/spencer/data/wikipedia/enwiki-latest-pages-articles.xml'
// const path = '/Users/spencer/data/wikipedia/simplewiki-latest-pages-articles.xml';

const options = {
  file: path,
  workers: 1,
  log: function (worker, fs) {
    let roots = Object.keys(worker.templates)
    roots.forEach((root) => {
      let obj = worker.templates[root]
      let keys = Object.keys(obj)
      keys = keys.sort((a, b) => {
        if (obj[a] > obj[b]) {
          return -1
        } else if (obj[a] < obj[b]) {
          return 1
        }
        return 0
      })
      let total = worker.counts.pages || 1
      let arr = keys.map((k) => [k, (obj[k] / total) * 100])
      fs.writeFileSync(
        `./results/templates/${root}.json`,
        JSON.stringify(arr.slice(0, 70), null, 2)
      )
    })
    console.log(`\n--${worker.counts.pages}--\n`)
  },
  custom: function (doc, worker) {
    let result = doc.classify()
    result = result || {}
    // get page titles per root
    if (result.root) {
      worker.templates[result.root] = worker.templates[result.root] || []
      let templates = doc
        .templates()
        .map((obj) => obj.template)
        .filter((s) => s)
      templates.forEach((s) => {
        let title = s.toLowerCase()
        worker.templates[result.root][title] = worker.templates[result.root][title] || 0
        worker.templates[result.root][title] += 1
      })
    }
  },
}

dumpster(options)
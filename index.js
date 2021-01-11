const fs = require('fs')

const command = process.argv[2]
const title = process.argv[3]
const message = process.argv[4]

const errorHandler = (error) => {
    console.error(error.message)
}

const load = (done) => {
    fs.readFile('notes.json', (error, data) => {
        if (error) {
          if (error.code === 'ENOENT') {
              return done(null, [])
          } else {
              return done(error)
          }
        } 
        try {
            const notes = JSON.parse(data)
            done(null, notes)
        } catch (error) {
            done(new Error('Не удалось преобразовать файл'))
        }
    })
}


const save = (notes, done) => {
    try {
        const json = JSON.stringify(notes)  
        fs.writeFile('notes.json', json, error => {
            if (error) return done(error)
            done()
        }) 
    } catch (error) {
        done(new Error('Не удалось записать файл'))
    }    
}


const list = (done) => {
    load(done)
}

const view = (title, done) => {
    load((error, notes) => {
        if (error) return done(error)
        const note = notes.find(el => el.title === title)
        if (!note) return done(new Error('Заметка не найдена'))
        done(null, note)
    })
}

const create = (title, message, done) => {
    load((error, notes) => {
        if (error) return done(error)
        save([...notes, {title, message}], done)
    })
}

const remove = (title, done) => {
    load((error, notes) => {
        if (error) return done(error)
        save(notes.filter(el => el.title !== title), done)
    })
}

switch (command) {
    case 'ls':
        list((error, notes) => {
            if (error) return errorHandler(error)
            notes.forEach(({title = ''}, i) => {
                return console.log(`Запись ${++i}. "${title}"`)
            })
        })
    break
    case '-v':
        view(title, (error, note) => {
            if (error) return errorHandler(error)
            return console.log(`Запись "${note.title}"\r\n-------\r\n${note.message}\r\n-------`)
        })
    break
    case '-c':
        create(title, message, error => {
            if (error) return errorHandler(error)
            return console.log(`Запись "${title}" создана`)
        })
    break
    case '-d':
        remove(title, error => {
            if (error) return errorHandler(error)
            return console.log(`Запись "${title}" удалена`)
        })
    break
    default:
        console.log('Вы ввели неизвестную команду')
    break
} 
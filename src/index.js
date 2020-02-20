const Nightmare = require('nightmare'),
    sharp = require('sharp'),
    path = require('path'),
    glob = require('glob'),
    waitPrompt = +(+process.argv[2] + '000') || 28000,
    sizeImg = 39000,
    qualityImg = 100


    glob(process.cwd() + '/**/*.html', function (err, files) {
 
        if (err) {
            console.log(err);
        } else {
            files.forEach(file => {
                const pathOfHtml = 'file://' + path.resolve(file)
                const splittedPathFile = file.split('/')
                const pathFolder = splittedPathFile.slice(0, splittedPathFile.length - 1).join('/') + '/'

                screenShot(pathOfHtml, pathFolder)
            })
        }
    })

    async function screenShot(pathFile, pathFolder) {
        const nightmare = new Nightmare({
            show: false,
            frame: false,
            maxHeight: 16384,
            maxWidth: 16384
        })
        let shotName
        const dimensionsImg = {}

        // get dimensions of the creative
        await nightmare.goto(pathFile)
            .wait('body')
            .evaluate(function () {
                const wrapper = document.querySelector('#wrapper')
    
                return {
                    height: wrapper.clientHeight,
                    width: wrapper.clientWidth
                }
            })
            .then(dimensions => {
                const dimensionsName = dimensions.width + 'x' + dimensions.height

                shotName = 'backup_' + dimensionsName + '.jpg'

                dimensionsImg.width = dimensions.width
                dimensionsImg.height = dimensions.height

                console.log('Dimensions: ' + dimensionsName)
            })
        
        //make a screenshot and put it to the buffer
        const buffer = await nightmare.viewport(dimensionsImg.width, dimensionsImg.height)
            .wait(waitPrompt)
            .screenshot()
            .end()
        
        shotName = pathFolder + shotName
       
        // resize and set the quality of the screenshot less than 39KB
        sharpImage(buffer, qualityImg, dimensionsImg.width, dimensionsImg.height, shotName, sizeImg)
    }
    
    function sharpImage(img, qualityImg, widthImg, heightImg, nameImg, sizeImg) {
        sharp(img)
            .jpeg({
                quality: qualityImg,
                progressive: true
            })
            .resize({
                width: widthImg,
                height: heightImg,
            })
            .toFile(nameImg)
            .then(function (newFileInfo) {
                if (newFileInfo.size < sizeImg) {
                    console.log('CREATED =>', `${widthImg}x${heightImg}`)
                    // console.log('Quality: ' + qualityImg + '%')
                    // console.log('File size: ' + newFileInfo.size.toString().slice(0, -3) + 'KB')
                    return
                } else {
                    sharpImage(img, qualityImg - 1, widthImg, heightImg, nameImg, sizeImg)
                }
            })
            .catch(function (err) {
                console.log("Something wrong")
            })
    }
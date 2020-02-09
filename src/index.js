const Nightmare = require('nightmare'),
    sharp = require('sharp'),
    path = require('path'),
    splittedDirname = path.resolve('index.html').split('/'),
    screenshotName = 'backup_' + splittedDirname[splittedDirname.length - 2] + '.jpg',
    waitPrompt = +(+process.argv[2] + '000'),
    dimensionsImg = {},
    sizeImg = 39000,
    qualityImg = 100,
    filePath = 'file://' + path.resolve('index.html')

screenShot()

async function screenShot() {
    const nightmare = new Nightmare({
        show: false,
        frame: false,
        maxHeight: 16384,
        maxWidth: 16384
    })

    // get dimensions of the creative
    await nightmare.goto(filePath)
        .wait('body')
        .evaluate(function () {
            const wrapper = document.querySelector('#wrapper')

            return {
                height: wrapper.clientHeight,
                width: wrapper.clientWidth
            }
        })
        .then(dimensions => {
            dimensionsImg.width = dimensions.width
            dimensionsImg.height = dimensions.height
            console.log('Dimensions: ' + dimensions.width + ' x ' + dimensions.height)
        })
    
    //make a screenshot and put it to the buffer
    const buffer = await nightmare.viewport(dimensionsImg.width, dimensionsImg.height)
        .wait(waitPrompt)
        .screenshot()
        .end()
    
    // resize and set the quality of the screenshot less than 39KB
    await sharpImage(buffer, qualityImg, dimensionsImg.width, dimensionsImg.height, screenshotName, sizeImg)
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
                console.log('Quality: ' + qualityImg + '%')
                console.log('File size: ' + newFileInfo.size.toString().slice(0, -3) + 'KB')
                return
            } else {
                sharpImage(img, qualityImg - 1, widthImg, heightImg, nameImg, sizeImg)
            }
        })
        .catch(function (err) {
            console.log("Something wrong")
        })
}
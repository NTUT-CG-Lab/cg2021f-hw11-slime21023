
import { ScaleField, Gaussian } from './jsm/scaleField.js'
import { threejsViewer } from './jsm/threejsViewer.js'
import { ControlView, colorSetting } from './jsm/controlView.js'

const fileRegex = /(\w+)_(\d+)_(\d+)_(\d+)_(\w+)\.*/
let modelView = null
let field = null
let arg = new colorSetting()
const controlView = new ControlView(document.getElementById('palette'), arg)

const getColormap = () => {
    const color = new Uint8ClampedArray(256 * 4)
    for (let i = 0; i < 256; i++) {
        color[4 * i] = arg.rgba[0][i] * 255
        color[4 * i + 1] = arg.rgba[1][i] * 255
        color[4 * i + 2] = arg.rgba[2][i] * 255
        color[4 * i + 3] = arg.rgba[3][i] * 255
    }

    return color
}

const init = () => {
    const closeBtn = document.getElementById('closeBtn')
    const controlPanel = document.getElementById('controlPanel')
    const content = controlPanel.getElementsByClassName('panelContent')[0]

    const loadLocalRawFile = (path, onload) => {
        const xhr = new XMLHttpRequest()
        xhr.responseType = 'arraybuffer'
        xhr.open('GET', path)
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    onload(xhr.response)
                }
            }
        }
        xhr.send()
    }

    closeBtn.addEventListener('click', evt => {
        evt.preventDefault()

        if (controlPanel.dataset.collapsed == 'true') {
            content.classList.remove('close')
            content.classList.add('open')
            controlPanel.dataset.collapsed = false
        } else {
            content.classList.add('close')
            content.classList.remove('open')
            controlPanel.dataset.collapsed = true
        }
    })

    let elements = document.getElementsByName('settingForm')

    //MIPS or ISO
    document.querySelectorAll('input[name=rtype]').forEach((option) => {
        option.addEventListener('click', () => {
            arg.renderType = option.value == 'mips' ? 0 : 1
            controlView.updateRGBA()
        })
    })

    arg.renderType = 0

    // RAW文件讀取
    loadLocalRawFile('./raw/CTchest_64_64_64_uint8.raw', (result) => {
        const width = 64
        const height = 64
        const depth = 64
        const bit = 8

        const data = new Uint8ClampedArray(result)

        field = new ScaleField(width, height, depth, data, arg)

        controlView.updateVolumeData(field)
    })
}

window.onload = () => {
    modelView = new threejsViewer(document.body)

    init()
    //當調色盤的參數變更時，觸發事件
    controlView.addEventListener('change', () => {
        if (!field) return
        modelView.renderVolume(field, getColormap(), arg)
    })
}
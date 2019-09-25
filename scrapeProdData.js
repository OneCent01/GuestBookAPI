const { fetch }  = require('./fetch.js')
const cheerio = require('cheerio')

const scrapeKeHEDatabase = url => new Promise((resolve, reject) => {
	fetch('GET', url)
	.then(html => {
		const validProps = ['Brand', 'Description','CasePack']
		const cheeroPage = cheerio.load(html)
		const table = cheeroPage('table')[1]
		const cheerioTable = cheerio.load(table)
		const productRows = cheerioTable('tr')
		const titlesRows = productRows[0]
		const cheerioTitles = cheerio.load(titlesRows)
		const titlesCols = cheerioTitles('th')
		const titles = []
		let i = 1
		let cheerioTitle, titleText
		while(i < titlesCols.length) {
			cheerioTitle = cheerio.load(titlesCols[i])
			titleText = cheerioTitle.text().trim()
			titles.push(titleText)
			i++
		}
		const values = []
		const row = productRows[1]
		const cheerioValues = cheerio.load(row)
		const rowValuesCol = cheerioValues('td')
		i = 2
		let cheerioValue, valueText
		while(i < rowValuesCol.length) {
			cheerioValue = cheerio.load(rowValuesCol[i])
			values.push(cheerioValue.text().trim())
			i++
		}

		const dataObj = titles.reduce((final, prop, i) => {
			if(
				validProps.includes(prop)
				&& values[i].length 
				&& values[i] !== 'log in!'
			) {
				let daProp = (
					prop === 'Description' ? 'title' 
					: prop === 'CasePack' ? 'quantity'
					: prop
				)
				final[daProp] = values[i]
			}
			return final
		}, {})
		resolve(dataObj)

	})
	.catch(err => resolve({}))
})

const scrapeUpcDatabase = url => new Promise((resolve, reject) => {
	fetch('GET', url)
	.then(html => {
		const validProps = ['Description', 'Size/Weight', 'Issuing Country']
		const productPage = cheerio.load(html)
		const table_rows = productPage('.data tr')
		const tableData = {}
		Object.keys(table_rows).forEach(row => {
			const tableRow = cheerio.load(table_rows[row])
			const tableCells = tableRow('td')
			const rowData = []
			Object.keys(tableCells).forEach(colIndex => {
				const typedColIndex = +colIndex
				if(!isNaN(typedColIndex)) {
					const currentCell = tableCells[typedColIndex]
					const currentCellVal = cheerio.load(currentCell).text().trim()
					if(currentCellVal && currentCellVal.length) {
						rowData.push(currentCellVal)
					}
				}
			})
			if(
				rowData.length === 2 
				&& validProps.includes(rowData[0])
			) {
				tableData[rowData[0]] = rowData[1]
			}
		})
		resolve(tableData)

	})
	.catch(err => resolve({}))
})

const scrapeUpcItemDb = url => new Promise((resolve, reject) => {
	fetch('GET', url)
	.then(html => {
		const productPage = cheerio.load(html)
		
		const productData = {}

		const titles = productPage('.cont ol li')
		const titlesText = Object.keys(titles).map(rowIndex => {
			const titleRow = titles[rowIndex].children
			if(
				titleRow 
				&& titleRow.length 
				&& Array.isArray(titleRow)
			) {
				return titleRow[0].data
			}
			return false
		}).filter(Boolean)
		productData.titles = titlesText

		const imageElement = productPage('.main-img img')[0]
		const imgUrl = imageElement.attribs.src
		productData.image = imgUrl
		
		resolve(productData)
	})
	.catch(err => resolve({}))
})

const scrapeBarcodelookup = url => new Promise((resolve, reject) => {
	fetch('GET', url)
	.then(html => {
		const productPage = cheerio.load(html)
		const productData = {}
		const title = productPage('.product-details h4')
		productData.title = title.text().trim()

		const img = productPage('#img_preview')[0]
		const imgUrl = img.attribs['data-cfsrc']
		productData.image = imgUrl
		
		const productRows = productPage('.product-details .row')[1]
		const detailsRows = cheerio.load(productRows)('div div')
		const detailsRowsKeys = Object.keys(detailsRows)
		detailsRowsKeys.forEach(detailIndex => {
			const typedDetailIndex = +detailIndex
			if(!isNaN(typedDetailIndex)) {
				const row = detailsRows[detailIndex]
				const rowData = cheerio.load(row).text().split(':')
				if(rowData.length === 2) {
					productData[rowData[0].trim()] = rowData[1].trim()
				}
			}
		})

		resolve(productData)
	})
	.catch(err => resolve({}))
})

const scraperlessPromise = () => new Promise((resolve, reject) => resolve({}))

const scrapers = {
	'www.upcdatabase.com': scrapeUpcDatabase,
	'www.upcitemdb.com': scrapeUpcItemDb,
	'www.barcodelookup.com': scrapeBarcodelookup,
	'gourmet.kehe.com': scrapeKeHEDatabase
}

const lookupProduct = (barcode, baseUrl) => {
	const url = baseUrl.replace('|BARCODE|', barcode)
	const host = new URL(url).hostname
	const scraperPromise = scrapers[host]
	const scaperFound = (scraperPromise && typeof scraperPromise === 'function')
	return scaperFound ? scraperPromise(url) : scraperlessPromise()
}

const objectKeysToLowerCase = object => Object.keys(object).reduce((final, prop) => {
	final[prop.toLowerCase()] = object[prop]
	return final
}, {})

const uniteProductData = async dataPromise => {
	const data = (await dataPromise).map(objectKeysToLowerCase)

	return data.reduce((final, datum) => ({
		...final, 
		...datum,
		titles: [
			...final.titles, 
			...(
				datum.title ? [datum.title] 
				: (datum.titles && datum.titles.length) ? datum.titles 
				: datum.description ? [datum.description]
				: []
			)
		],
		images: [
			...final.images,
			...(
				datum.images ? datum.images
				: datum.image ? [datum.image]
				: datum.imgurl ? [datum.imgurl]
				: []
			)
		]
	}), {
		titles:[],
		images: []
	})
}


const lookups = [
	'https://www.upcdatabase.com/item/|BARCODE|',
	'https://www.upcitemdb.com/upc/|BARCODE|',
	'https://www.barcodelookup.com/|BARCODE|',
	'https://gourmet.kehe.com/search?search=|BARCODE|'
]

const fetchProductData = barcode => uniteProductData(
	Promise.all(
		lookups.map(
			lookup => lookupProduct(
				barcode, lookup
			)
		)
	)
)


module.exports = {
	fetchProductData
}
const https = require('https')
const cheerio = require('cheerio')

const ajax = (method, url, payload=undefined) => new Promise((resolve, reject) => {
	https.get(
		url,
		res => {
			const dataBuffers = []
			res.on('data', data => dataBuffers.push(data.toString('utf8')))
			res.on('end', () => resolve(dataBuffers.join('')))
		}
	).on('error', reject)
})

const scrapeUpcDatabase = url => new Promise((resolve, reject) => {
	ajax('GET', url)
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
	ajax('GET', url)
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
	ajax('GET', url)
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
	upcdatabase: scrapeUpcDatabase,
	upcitemdb: scrapeUpcItemDb,
	barcodelookup: scrapeBarcodelookup
}

const lookupProduct = (barcode, baseUrl) => {
	const url = baseUrl.replace('|BARCODE|', barcode)
	const host = new URL(url).hostname.split('.').slice(1, -1).join('.')
	const scraper = scrapers[host]
	const scaperFound = (scraper && typeof scraper === 'function')
	
	return scaperFound ? scraper(url) : scraperlessPromise()
}

const uniteProductData = async dataPromise => {
	const data = await dataPromise
	return data.reduce((final, datum) => ({
		...final, 
		...datum,
		titles: [
			...final.titles, 
			...(
				datum.title ? [datum.title] 
				: (datum.titles && datum.titles.length) ? datum.titles 
				: []
			)
		],
		images: [
			...final.images,
			...(
				datum.images ? datum.images
				: datum.image ? [datum.image]
				: datum.imgUrl ? [datum.imgUrl]
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
	'https://www.barcodelookup.com/|BARCODE|'
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
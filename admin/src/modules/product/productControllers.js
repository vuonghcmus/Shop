
import _ from 'lodash'
import helpers from '../../helpers'
import firebaseService from '../../services/firebaseService'
import productService from '../../services/productService'
const productControllers = {
    async index(req, res) {

        const { page = 1, perPage = 10, type = "", q = "" } = req.query
        const { data, total } = await productService.getProducts({ q, page, perPage })

        const state = {
            title: 'Sản phẩm',
            page,
            perPage: Math.min(perPage, data.length),
            data,
            total,
            header: ["Tên sản phẩm", "Danh mục", "Hãng sản xuất", "Giá nhập", "Giá bán", "Số lượng", "Mô tả", "Hình ảnh"]
        }

        res.render('products/index', { ...state, pagination: { page, limit: Math.ceil(total / perPage), perPage: perPage } })
    },

    async topSeller(req, res) {

        const { page = 1, perPage = 10, type = "" } = req.query
        const { data, total } = await productService.getTopSellers({ page, perPage, type })

        const state = {
            title: 'Top 10 sản phẩm bán chạy nhất',
            page,
            total,
            perPage,
            data,
            header: ["Tên sản phẩm", "Danh mục", "Hãng sản xuất", "Giá nhập", "Giá bán", "Mô tả", "Hình ảnh"]
        }

        res.render('products/top', { ...state, pagination: { page, limit: Math.ceil(total / perPage), perPage: perPage } })
    },

    async createProduct(req, res) {
        if (!_.isEmpty(req.body)) {
            const { name, categoryType: type, description, manufacturer: manufacturerName, originPrice, currentPrice, quantity } = req.body
            const images = await firebaseService.uploadMultipleFiles(req.files);
            await productService.createProduct({ name, description, category: { type }, manufacturer: { name: manufacturerName }, quantity, originPrice, currentPrice, images })
            return res.redirect('/products/create')

        }
        const title = "Thêm sản phẩm"
        res.render('products/create', { title })
    },
    async editProduct(req, res) {
        const { id } = req.params
        const title = "Cập nhật sản phẩm"
        if (_.isEmpty(req.body)) {
            const product = await productService.getProductById({ id })
            res.render('products/edit', { product, image1: product.images[0] || "", image2: product?.images[1] || "", title })
        } else {
            const { name, categoryType: type, description, manufacturer: manufacturerName, originPrice, currentPrice, quantity } = req.body
            const images = await firebaseService.uploadMultipleFiles(req.files);
            await productService.updateProductById({ id, name, description, category: { type }, manufacturer: { name: manufacturerName }, quantity, originPrice, currentPrice, images })
            return res.redirect('/products')
        }

    },
    async confirmScreen(req, res) {
        const { id = "" } = req.params

        const product = await productService.getProductById({ id })

        res.render('products/confirm', { productName: product.name, id })
    }
    ,
    async deleteProduct(req, res) {
        const { id = "", status = "canceled" } = req.params

        if (status === "accepted") {
            await productService.deleteProductById({ id })
        }
        return res.redirect('/products')

    }
}

export default productControllers
import ProductDetailPage from "@/components/ProductDetails";


export default function ProductPage({params}: {params: {barcode: string}}){
    const {barcode} = params;
    
	return (
    <ProductDetailPage barcode={barcode}/>
  )
}
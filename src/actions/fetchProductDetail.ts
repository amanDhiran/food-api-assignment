"use server"

import axios from "axios";

export async function fetchProductDetails(barcode: string) {
    const res = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    return res.data.product;
  }
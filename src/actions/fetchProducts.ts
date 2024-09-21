"use server"
import axios from "axios";

export default async function fetchProducts(page: number, searchTerm: string = '', category: string = ''){
    const res = await axios.get(
      `https://world.openfoodfacts.org/cgi/search.pl?action=process&json=true&page=${page}&page_size=24&search_terms=${searchTerm}&tagtype_0=categories&tag_contains_0=contains&tag_0=${(category === "all") ? "" : category}`
    );
    return res.data.products;
  };
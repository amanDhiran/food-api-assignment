"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import fetchProducts from "@/actions/fetchProducts";
import { Loader2, Search } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";

interface Product {
  product_name: string;
  image_url: string;
  categories_tags: Array<string>;
  ingredients_tags: Array<string>;
  nutrition_grades: string;
  code: number;
}

interface Category {
  id: string;
  name: string;
}

const fetchCategories = async (): Promise<Category[]> => {
  const res = await axios.get(
    "https://world.openfoodfacts.org/categories.json"
  );
  return res.data.tags.map((tag: any) => ({
    id: tag.id,
    name: tag.name,
  }));
};

export default function ProductList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [nameQuery, setNameQuery] = useState("");
  const [barcodeQuery, setBarcodeQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");
  const [fetchingMoreProducts, setFetchingMoreProducts] = useState<boolean>(false);

  const router = useRouter();
  useEffect(() => {
    setLoading(true);
    const loadProducts = async () => {
      const newProducts = await fetchProducts(page, query, selectedCategory);
      setProducts((prevProducts) =>
        page === 1 ? newProducts : [...prevProducts, ...newProducts]
      );
      setLoading(false);
    };

    loadProducts();
  }, [query, selectedCategory]);

  //load categories
  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategories();
      setCategories(
        fetchedCategories.sort((a: Category, b: Category) =>
          a.name.localeCompare(b.name)
        )
      );
    };

    loadCategories();
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    setQuery(nameQuery);
  };

  const handleBarcodeSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (barcodeQuery) {
      router.push(`/product/${barcodeQuery}`)
    }
  };

  const loadMoreProducts = async () => {
    setFetchingMoreProducts(true);

    const newProducts = await fetchProducts(page + 1, query, selectedCategory);

    setProducts((prevProducts) => [...prevProducts, ...newProducts]);

    setPage((prevPage) => prevPage + 1);

    setFetchingMoreProducts(false);
  };

  const filterAndSortProducts = () => {
    let sortedProducts = [...products];

    switch (sortOption) {
      case "name_asc":
        sortedProducts.sort((a, b) =>
          a.product_name.localeCompare(b.product_name)
        );
        break;
      case "name_desc":
        sortedProducts.sort((a, b) =>
          b.product_name.localeCompare(a.product_name)
        );
        break;
      case "grade_asc":
        sortedProducts.sort((a, b) =>
          a.nutrition_grades.localeCompare(b.nutrition_grades)
        );
        break;
      case "grade_desc":
        sortedProducts.sort((a, b) =>
          b.nutrition_grades.localeCompare(a.nutrition_grades)
        );
        break;
      default:
        // No sorting
        break;
    }

    setProducts(sortedProducts);
  };

  useEffect(() => {
    filterAndSortProducts();
  }, [sortOption]);

  const filterAndRemoveEnglishPrefix = (categories: string[]) => {
    return categories
      .filter((category) => category.startsWith("en:"))
      .map((category) => category.replace("en:", ""));
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Food Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by name..."
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
            />
            <Button type="submit" variant={"outline"}><Search/></Button>
          </form>
          <form onSubmit={handleBarcodeSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search by barcode..."
            value={barcodeQuery}
            onChange={(e) => setBarcodeQuery(e.target.value)}
          />
          <Button type="submit" variant={"outline"}><Search/></Button>
          </form>
          <Select
            onValueChange={(value) => setSelectedCategory(value)}
            defaultValue=""
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">Name (A-Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z-A)</SelectItem>
              <SelectItem value="grade_asc">Nutrition Grade (A-E)</SelectItem>
              <SelectItem value="grade_desc">Nutrition Grade (E-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {loading ? (
          <FoodProductsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(
              (product, i) =>
                product.product_name && (
                  <Link
                    href={{
                      pathname: `/product/${product.code}`,
                    }}
                    key={i}
                    className="border rounded-lg p-4 shadow-md"
                  >
                    <div className="w-full h-56">
                      <Image
                        width={200}
                        height={200}
                        src={product.image_url || "/placeholder-image.jpg"}
                        alt={product.product_name || "No Image"}
                        className=" w-full h-full object-contain"
                      />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">
                      {product.product_name}
                    </h2>
                    <p className="text-gray-600 mb-2">
                      {" "}
                      <span className="font-semibold mr-2">Category:</span>
                      {filterAndRemoveEnglishPrefix(
                        product.categories_tags
                      ).join(", ")}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Barcode: {Number(product.code)}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Ingredients:{" "}
                      {filterAndRemoveEnglishPrefix(
                        product.ingredients_tags
                      ).join(", ")}
                    </p>
                    <p className="font-bold">
                      Nutrition Grade:
                      <span
                        className={`ml-2 px-2 py-1 rounded ${
                          product.nutrition_grades === "a"
                            ? "bg-green-500"
                            : product.nutrition_grades === "b"
                            ? "bg-lime-500"
                            : product.nutrition_grades === "c"
                            ? "bg-yellow-500"
                            : product.nutrition_grades === "d"
                            ? "bg-orange-500"
                            : "bg-red-500"
                        } text-white`}
                      >
                        {product.nutrition_grades.toUpperCase()}
                      </span>
                    </p>
                  </Link>
                )
            )}
          </div>
        )}
        {products.length < 20 ? (
          ""
        ) : (
          <div className="flex justify-center mt-4">
            {fetchingMoreProducts ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <Button
                variant={"outline"}
                onClick={loadMoreProducts}
                className="mt-6"
              >
                Load More...
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function FoodProductsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 shadow-md space-y-4">
            <Skeleton className="w-full h-56" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

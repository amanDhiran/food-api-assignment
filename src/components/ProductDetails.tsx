"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchProductDetails } from "@/actions/fetchProductDetail";
import { Skeleton } from "./ui/skeleton";

interface ProductDetail {
  product_name: string;
  image_url: string;
  categories_tags: Array<string>;
  ingredients_tags: Array<string>;
  nutrition_grades: string;
  code: number;
  labels_tags: Array<string>;
}

interface Nutrients {
    Carbohydrates: string;
    Energy: string;
    Fat: string;
    Protein: string;
    Salt: string;
    Sodium: string;
    Sugar: string
}

export default function ProductDetailPage({ barcode }: { barcode: string }) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [nutrientData, setNutrientData] = useState<Nutrients | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      const fetchedProduct = await fetchProductDetails(barcode);
      setProduct(fetchedProduct);
      setNutrientData({
        Carbohydrates:`${fetchedProduct.nutriments.carbohydrates_value}g` as string,
        Energy: `${fetchedProduct.nutriments.energy_value}kJ` as string,
        Fat: `${fetchedProduct.nutriments.fat_value}g` as string,
        Protein: `${fetchedProduct.nutriments.proteins_value}g` as string,
        Salt: `${fetchedProduct.nutriments.salt_value}g` as string,
        Sodium: `${fetchedProduct.nutriments.sodium_value}g` as string,
        Sugar: `${fetchedProduct.nutriments.sugars_value}g` as string
      })
      setLoading(false);
    };
    loadDetails();
  }, []);

  const filterAndRemoveEnglishPrefix = (arr: string[]) => {
    // Filter categories that start with "en:" and remove the prefix
    return arr
      .filter((item) => item.startsWith("en:")) // Filter "en:" categories
      .map((item) => item.replace("en:", "")); // Remove the "en:" prefix
  };

  if(loading){
    return <ProductDetailSkeleton/>
  }
  return (
    <>
      {product && (
        <div className="container mx-auto px-4 py-8">
            <Link
          href="/"
          className=" flex mb-5 text-sm md:text-base text-primary hover:text-primary/70 transition-colors"
        >
          <ArrowLeft className="mr-2" />
          Back to Home
        </Link>
          <Card className="mb-8">
            <CardHeader className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-1/3 h-32 md:h-72">
                <Image
                  width={200}
                  height={200}
                  src={product.image_url || "/placeholder-image.jpg"}
                  alt={product.product_name || "No Image"}
                  className=" w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">
                  {product.product_name}
                </CardTitle>
                <div className="flex mb-3 flex-wrap gap-2">
                  {filterAndRemoveEnglishPrefix(product.labels_tags).map(
                    (label) => (
                      <Badge key={label} variant="secondary">
                        {label}
                      </Badge>
                    )
                  )}
                </div>
                <p className="text-gray-600 mb-2">
                  {" "}
                  <span className="font-semibold mr-2 text-sm">
                    Categories:
                  </span>
                  {filterAndRemoveEnglishPrefix(product.categories_tags).join(
                    ", "
                  )}
                </p>
                <div className="flex mt-3 items-center">
                  <span className="font-semibold mr-2">Nutrition Grade:</span>
                  <Badge
                    className={`${
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
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{filterAndRemoveEnglishPrefix(product.ingredients_tags).join(', ')}</p>
            </CardContent>
          </Card>

          {nutrientData && <Card className="mb-8">
                <CardHeader>
                   <CardTitle>Nutritional Values (per 100g)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Nutrient</TableHead>
                            <TableHead>Value</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {Object.entries(nutrientData).map(([nutrient, value]) => (
                            <TableRow key={nutrient}>
                            {value !== "0g" && value !== "0kJ" && <>
                                <TableCell className="font-medium capitalize">{nutrient.replace('_', ' ')}</TableCell>
                                <TableCell>{value}</TableCell>
                                </>
                            }
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>}

        </div>
      )}
    </>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex mb-5 text-sm md:text-base text-primary">
        <ArrowLeft className="mr-2 text-primary/10 animate-pulse" />
        <Skeleton className="h-5 w-24" />
      </div>
      
      <Card className="mb-8">
        <CardHeader className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-1/3 h-32 md:h-72">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="flex-1 w-full">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <div className="flex mb-3 flex-wrap gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-20" />
              ))}
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex mt-3 items-center">
              <Skeleton className="h-4 w-32 mr-2" />
              <Skeleton className="h-6 w-8" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

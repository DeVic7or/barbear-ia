import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Edit, Trash2 } from "lucide-react";

const mockProducts = [
  {
    id: "1",
    name: "Pomada Modeladora",
    category: "Cabelo",
    price: 35.90,
    stock: 15,
    status: "Em estoque",
  },
  {
    id: "2",
    name: "Óleo para Barba",
    category: "Barba",
    price: 42.00,
    stock: 8,
    status: "Em estoque",
  },
  {
    id: "3",
    name: "Shampoo Anti-Resíduo",
    category: "Cabelo",
    price: 28.50,
    stock: 3,
    status: "Estoque baixo",
  },
  {
    id: "4",
    name: "Cera Finalizadora",
    category: "Cabelo",
    price: 38.90,
    stock: 12,
    status: "Em estoque",
  },
  {
    id: "5",
    name: "Balm para Barba",
    category: "Barba",
    price: 45.00,
    stock: 0,
    status: "Esgotado",
  },
  {
    id: "6",
    name: "Gel Fixador Forte",
    category: "Cabelo",
    price: 32.00,
    stock: 20,
    status: "Em estoque",
  },
];

const Products = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em estoque":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "Estoque baixo":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "Esgotado":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
            <p className="text-muted-foreground mt-1">Gerencie o estoque de produtos da barbearia</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockProducts.map((product) => (
            <Card key={product.id} className="border-border/40 bg-card/50 backdrop-blur hover:bg-card/80 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary/80">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-foreground">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <Badge className={getStatusColor(product.status)}>
                    {product.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estoque:</span>
                  <span className="font-semibold text-foreground">{product.stock} unidades</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Products;

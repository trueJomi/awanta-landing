import React from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaNivelCrediticio } from "@/validators/nivel-crediticio";
import type { z } from "astro:content";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Results from "./Results";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { InfoIcon, SearchIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import InfoScore from "./InfoScore";
import type { Score, Score2 } from "@/models/NivelCredito";
import { getScoring } from "@/service/deuda.service";

function FormNivel() {
  const form = useForm({
    resolver: zodResolver(schemaNivelCrediticio),
    defaultValues: {
      dni: "",
    },
  });
  const [loading, setLoading] = React.useState(false);
  const [score, setScore] = React.useState<Score2>();
  const handleSubmit = (data: z.infer<typeof schemaNivelCrediticio>) => {
    setScore(undefined);
    setLoading(true);
    getScoring(data)
      .then((response) => {
        setScore(response);
      })
      .catch((error) => {
        form.setError("dni", {
          type: "custom",
          message: error ? error.message : "Error al consultar el nivel crediticio",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <main className="font-poppins space-y-5">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Consultar Nivel Crediticio</CardTitle>
          <CardDescription>
            Ingresa tu DNI para conocer tu historial crediticio y score de
            pagos. Esta información te ayudará a entender tu situación
            financiera actual.
          </CardDescription>
          <CardAction>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="rounded-full aspect-square h-10">
                  <InfoIcon />
                </Button>
              </DialogTrigger>
              <DialogContent className=" font-poppins">
                <InfoScore />
              </DialogContent>
            </Dialog>
          </CardAction>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="dni"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} placeholder="DNI" type="tel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={!form.formState.isValid || loading}
                className="mt-4 w-full"
              >
                <span className="h-4 w-4">
                  <SearchIcon />
                </span>{" "}
                Consultar Nivel Crediticio
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <div>
        <Results data={score} loading={loading} />
      </div>
    </main>
  );
}

export default FormNivel;

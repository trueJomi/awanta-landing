import type { Score } from "@/models/NivelCredito";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { creditScoreRanges } from "@/constant/score";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import {
  BanknoteArrowUpIcon,
  BanknoteX,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import CardStats from "./CardStats";

interface Props {
  data?: Score;
  loading: boolean;
}

function Results({ data, loading }: Props) {
  return (
    <div className="min-h-72 font-poppins">
      {data ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Puntaje Crediticio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="space-y-4">
                <h1
                  style={{
                    color: creditScoreRanges[data.score].color,
                  }}
                  className={`text-5xl font-medium `}
                >
                  {data.puntos}
                </h1>
                <HoverCard openDelay={1000}>
                  <HoverCardTrigger asChild>
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: creditScoreRanges[data.score].color,
                      }}
                      className="uppercase  px-4 py-2 text-white"
                    >
                      {creditScoreRanges[data.score].text}
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="text-sm font-poppins">
                      {creditScoreRanges[data.score].descripcion}
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <div className="max-w-md mx-auto">
                  <Progress value={data.puntos} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>0</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
              <div className=" grid md:grid-cols-2 gap-4">
                <CardStats
                  title="Pagos Puntuales"
                  color="#16a34a" // green-500
                  value={`${data.puntualidad}%`}
                  description="Este es el porcentaje de pagos puntuales que ha realizado."
                  Icon={BanknoteArrowUpIcon}
                />
                <CardStats
                  title="Promedio de Morosidad"
                  color="#fbbf24" // yellow-500
                  value={`${data.promedioMora} dias`}
                  description="Este es el promedio de morosidad en dias de sus deudas."
                  Icon={BanknoteX} // Reemplaza con el ícono que desees
                />
                <CardStats
                  title="Incidencias Graves"
                  color="#ef4444" // red-500
                  value={`${data.insidenciaGrave ?? 0}`}
                  description="Este es el número de incidencias graves en su historial crediticio."
                  Icon={TriangleAlert} // Reemplaza con el ícono que desees
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-72">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="text-center text-">
              Ingrese su DNI para consultar su puntaje crediticio.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Results;

import { creditScoreList } from "@/constant/score";
import { Button } from "../ui/button";
import {
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Badge } from "../ui/badge";

function InfoScore() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Información del Puntaje Crediticio</DialogTitle>
        <DialogDescription>
          Aquí puedes encontrar información detallada sobre tu puntaje
          crediticio, incluyendo factores que lo afectan y cómo mejorarlo.
        </DialogDescription>
      </DialogHeader>
      <ul className="gap-6 grid" >
        {creditScoreList.map((score) => (
          <li key={score.key} className="flex items-center gap-3">
            <div className="min-w-22 uppercase flex justify-center" >
              <Badge style={{ backgroundColor: score.color }} >{score.text}</Badge>
            </div>
            <div>
              <h3 className=" font-semibold" >
                {score.min} - {score.max}
              </h3>
              <p className="text-sm text-gray-500" >{score.descripcion}</p>
            </div>
          </li>
        ))}
      </ul>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary" className="w-full">
            Cerrar
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}

export default InfoScore;

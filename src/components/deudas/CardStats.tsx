import { type LucideIcon } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface Props {
  title: string;
  value: string;
  description: string;
  color: string;
  Icon: LucideIcon;
}

function CardStats({ title, value, description, Icon, color }: Props) {
  return (
    <Card className=" font-poppins">
      <CardHeader>
        <CardTitle
          style={{
            color,
          }}
        >
          {title}
        </CardTitle>
        <CardDescription className="text-xs text-gray-500">
          {description}
        </CardDescription>
        <CardAction>
          <Icon
            style={{
              color,
            }}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <h2
          style={{
            color,
          }}
          className="text-3xl font-bold text-center"
        >
          {value}
        </h2>
      </CardContent>
    </Card>
  );
}

export default CardStats;

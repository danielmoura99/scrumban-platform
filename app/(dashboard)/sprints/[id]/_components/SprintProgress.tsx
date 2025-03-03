//app/(dashboard)/sprints/[id]/_components/SprintProgress.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, addDays, format } from "date-fns";

type Sprint = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tasks: any[];
};

interface SprintProgressProps {
  sprint: Sprint;
  completedTasks: number;
  totalTasks: number;
}

export default function SprintProgress({
  sprint,
  completedTasks,
  totalTasks,
}: SprintProgressProps) {
  // Converter datas de string para objetos Date, se necessário
  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const today = new Date();

  // Calcular a duração total do sprint em dias
  const sprintDuration = differenceInDays(endDate, startDate) + 1; // +1 para incluir o último dia

  // Calcular quantos dias já se passaram desde o início do sprint
  const daysElapsed = Math.min(
    differenceInDays(today, startDate),
    sprintDuration
  );

  // Para sprints já concluídos, considerar todos os dias como decorridos
  const effectiveDaysElapsed =
    sprint.status === "completed" ? sprintDuration : daysElapsed;

  // Calcular o progresso ideal baseado no tempo decorrido
  const idealProgress = Math.min(
    Math.round((effectiveDaysElapsed / sprintDuration) * totalTasks),
    totalTasks
  );

  // Gerar pontos para o gráfico burndown
  const generateBurndownPoints = () => {
    const points = [];

    // Se não houver tarefas, não há pontos para mostrar
    if (totalTasks === 0) {
      return [];
    }

    // Tarefa inicial - todas as tarefas pendentes
    points.push({
      day: 0,
      date: format(startDate, "dd/MM"),
      ideal: totalTasks,
      actual: totalTasks,
    });

    // Linha ideal - decaimento linear de tarefas
    for (let day = 1; day <= sprintDuration; day++) {
      const date = addDays(startDate, day);
      const idealRemaining = Math.max(
        totalTasks - Math.round((day / sprintDuration) * totalTasks),
        0
      );

      // Só incluímos pontos reais até o dia de hoje
      const isDatePassed = date <= today || sprint.status === "completed";

      // Para dias passados, calculamos o progresso real (simplificado)
      // Em um caso real, você buscaria dados históricos do seu backend
      // Aqui estamos apenas simulando uma curva real baseada no progresso atual
      let actualRemaining = totalTasks;
      if (isDatePassed) {
        // Se o sprint está completo, todas as tarefas estão concluídas no último dia
        if (sprint.status === "completed" && day === sprintDuration) {
          actualRemaining = 0;
        }
        // Caso contrário, fazemos uma interpolação linear simples
        else if (effectiveDaysElapsed > 0) {
          const progressRate = completedTasks / effectiveDaysElapsed;
          actualRemaining = Math.max(
            totalTasks - Math.min(Math.round(progressRate * day), totalTasks),
            totalTasks - completedTasks
          );
        }
      } else {
        // Para dias futuros, usamos o número atual de tarefas restantes
        actualRemaining = totalTasks - completedTasks;
      }

      points.push({
        day,
        date: format(date, "dd/MM"),
        ideal: idealRemaining,
        actual: isDatePassed ? actualRemaining : null,
      });
    }

    return points;
  };

  const burndownPoints = generateBurndownPoints();

  // Função para avaliar o status do progresso
  const evaluateProgress = () => {
    if (totalTasks === 0) return "neutral";

    // Se completamos mais tarefas que o ideal, estamos adiantados
    if (completedTasks > idealProgress) return "ahead";

    // Se estamos um pouco abaixo do ideal (até 80% do esperado), ainda estamos no caminho
    if (completedTasks >= idealProgress * 0.8) return "onTrack";

    // Caso contrário, estamos atrasados
    return "behind";
  };

  const progressStatus = evaluateProgress();

  // Textos e cores com base no status do progresso
  const progressFeedback = {
    ahead: {
      color: "text-green-600",
      badge: <Badge className="bg-green-100 text-green-800">Adiantado</Badge>,
      message: "O sprint está progredindo mais rápido que o esperado.",
    },
    onTrack: {
      color: "text-blue-600",
      badge: <Badge className="bg-blue-100 text-blue-800">No Caminho</Badge>,
      message: "O sprint está progredindo conforme o esperado.",
    },
    behind: {
      color: "text-yellow-600",
      badge: <Badge className="bg-yellow-100 text-yellow-800">Atrasado</Badge>,
      message: "O sprint está progredindo mais devagar que o esperado.",
    },
    neutral: {
      color: "text-gray-600",
      badge: <Badge className="bg-gray-100 text-gray-800">Sem Dados</Badge>,
      message: "Não há tarefas suficientes para avaliar o progresso.",
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Burndown Chart</CardTitle>
            {progressFeedback[progressStatus].badge}
          </div>
        </CardHeader>
        <CardContent>
          {totalTasks > 0 ? (
            <>
              {/* Aqui seria ideal usar um gráfico de linha com uma biblioteca como Recharts */}
              {/* Como estamos criando componentes individuais, vamos usar uma representação visual simplificada */}
              <div className="h-64 w-full flex items-end justify-between border-b border-l relative">
                {/* Eixo Y - texto */}
                <div className="absolute -left-10 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                  <span>{totalTasks}</span>
                  <span>{Math.round(totalTasks / 2)}</span>
                  <span>0</span>
                </div>

                {/* Pontos do burndown */}
                {burndownPoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center"
                    style={{
                      height: "100%",
                      flexBasis: `${100 / burndownPoints.length}%`,
                    }}
                  >
                    {/* Barra ideal */}
                    <div
                      className="w-3 bg-blue-200"
                      style={{
                        height: `${(point.ideal / totalTasks) * 100}%`,
                      }}
                    ></div>

                    {/* Barra real (se disponível) */}
                    {point.actual !== null && (
                      <div
                        className={`w-3 absolute ${
                          point.actual > point.ideal
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          height: `${(point.actual / totalTasks) * 100}%`,
                          bottom: 0,
                          left: `calc(${
                            (index / (burndownPoints.length - 1)) * 100
                          }% - 1.5px)`,
                        }}
                      ></div>
                    )}

                    {/* Data */}
                    <span className="text-xs text-gray-500 mt-1">
                      {point.date}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-4 space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-200 mr-2"></div>
                  <span>Ideal</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 mr-2"></div>
                  <span>Real</span>
                </div>
              </div>

              <p className={`mt-4 ${progressFeedback[progressStatus].color}`}>
                {progressFeedback[progressStatus].message}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-100 p-3 rounded">
                  <div className="text-lg font-bold">{totalTasks}</div>
                  <div className="text-xs text-gray-500">Total de Tarefas</div>
                </div>
                <div className="bg-green-100 p-3 rounded">
                  <div className="text-lg font-bold">{completedTasks}</div>
                  <div className="text-xs text-gray-500">Concluídas</div>
                </div>
                <div className="bg-blue-100 p-3 rounded">
                  <div className="text-lg font-bold">{idealProgress}</div>
                  <div className="text-xs text-gray-500">Progresso Ideal</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-6 text-gray-500">
              Nenhuma tarefa adicionada a este sprint ainda. Adicione tarefas
              para visualizar o gráfico de burndown.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sobre o Burndown Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            O gráfico burndown mostra como as tarefas do sprint estão sendo
            concluídas ao longo do tempo:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
            <li>
              <strong>Linha ideal:</strong> Representa o progresso esperado se
              as tarefas fossem completadas em ritmo constante durante o sprint.
            </li>
            <li>
              <strong>Linha real:</strong> Mostra quantas tarefas ainda estão
              pendentes a cada dia.
            </li>
            <li>
              <strong>Abaixo do ideal:</strong> O time está completando tarefas
              mais rápido que o esperado.
            </li>
            <li>
              <strong>Acima do ideal:</strong> O time está atrasado em relação
              ao esperado.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

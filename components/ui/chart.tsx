"use client"

import * as React from "react"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { Grid } from "@visx/grid"
import { Group } from "@visx/group"
import { scaleBand, scaleLinear } from "@visx/scale"
import { Bar } from "@visx/shape"
import { Text } from "@visx/text"
import { TooltipWithBounds, useTooltip } from "@visx/tooltip"

import { cn } from "@/lib/utils"

interface ChartData {
  name: string
  value: number
}

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: ChartData[]
  xAxisLabel?: string
  yAxisLabel?: string
}

export function Chart({ data, xAxisLabel = "Category", yAxisLabel = "Value", className, ...props }: ChartProps) {
  const width = 600
  const height = 400
  const margin = { top: 30, right: 30, bottom: 50, left: 60 }

  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom

  const x = (d: ChartData) => d.name
  const y = (d: ChartData) => d.value

  const xScale = scaleBand({
    range: [0, xMax],
    round: true,
    domain: data.map(x),
    padding: 0.4,
  })
  const yScale = scaleLinear({
    range: [yMax, 0],
    round: true,
    domain: [0, Math.max(...data.map(y))],
  })

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
  } = useTooltip<ChartData>()

  return (
    <div className={cn("w-full h-[400px]", className)} {...props}>
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <Grid
            xScale={xScale}
            yScale={yScale}
            width={xMax}
            height={yMax}
            stroke="black"
            strokeOpacity={0.1}
            xOffset={xScale.bandwidth() / 2}
          />
          <AxisBottom
            top={yMax}
            scale={xScale}
            tickFormat={(value) => value}
            stroke="black"
            tickStroke="black"
            tickLabelProps={{
              fill: "black",
              fontSize: 11,
              textAnchor: "middle",
            }}
          />
          <Text
            x={xMax / 2}
            y={yMax + margin.bottom - 10}
            textAnchor="middle"
            fontSize={12}
          >
            {xAxisLabel}
          </Text>
          <AxisLeft
            scale={yScale}
            stroke="black"
            tickStroke="black"
            tickLabelProps={{
              fill: "black",
              fontSize: 11,
              textAnchor: "end",
              dy: "0.33em",
              dx: "-0.33em",
            }}
          />
          <Text
            x={-yMax / 2}
            y={-margin.left + 15}
            transform={`rotate(-90)`}
            textAnchor="middle"
            fontSize={12}
          >
            {yAxisLabel}
          </Text>
          {data.map((d) => {
            const barWidth = xScale.bandwidth()
            const barHeight = yMax - (yScale(y(d)) ?? 0)
            const barX = xScale(x(d))
            const barY = yMax - barHeight
            return (
              <Bar
                key={`bar-${x(d)}`}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="hsl(var(--primary))"
                onMouseLeave={() => hideTooltip()}
                onMouseMove={() => {
                  const top = barY
                  const left = (barX ?? 0) + barWidth / 2
                  showTooltip({
                    tooltipData: d,
                    tooltipTop: top,
                    tooltipLeft: left,
                  })
                }}
              />
            )
          })}
        </Group>
      </svg>
      {tooltipData && (
        <TooltipWithBounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
        >
          <div className="text-sm">
            <strong>{tooltipData.name}</strong>
            <div>{tooltipData.value}</div>
          </div>
        </TooltipWithBounds>
      )}
    </div>
  )
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
ChartContainer.displayName = "ChartContainer"

export const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("z-50 min-w-[60px] rounded-md bg-white p-2 shadow-md", className)}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm", className)} {...props} />
))
ChartTooltipContent.displayName = "ChartTooltipContent"
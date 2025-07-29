"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type React from "react";

type QuizWrapperProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function QuizWrapper({
  title,
  children,
  className = "",
}: QuizWrapperProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

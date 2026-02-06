"use server";

import {
  getShapeMissionStatus as getShapeMissionStatusService,
  loadShapes as loadShapesService,
} from "../services/posting-shapes";

export async function loadShapes(eventId: string) {
  return loadShapesService(eventId);
}

export async function getShapeMissionStatus(shapeId: string) {
  return getShapeMissionStatusService(shapeId);
}

import { sf, sylo } from "@/lib/sylo"
import { useRemote, type Remote } from "@/lib/useRemote"
import {
  EXERCISE_RELATIONS,
  WITH_KNOWLEDGE,
  toExercise,
  toItem,
  type ExerciseDetail,
  type ExerciseItemRecord,
  type ExerciseRecord,
} from "@/features/exercises/exerciseModel"

/**
 * Un exercice et ses questions (`exercise_items`), chargés en parallèle.
 * `data` vaut `null` tant que rien n'est chargé.
 */
export function useExercise(id: number): Remote<ExerciseDetail | null> {
  return useRemote(
    async () => {
      const [record, items] = await Promise.all([
        sylo.get<ExerciseRecord>("exercises", id, {
          with: EXERCISE_RELATIONS,
          extra: WITH_KNOWLEDGE,
        }),
        sylo.queryAll<ExerciseItemRecord>("exercise_items", {
          filter: sf.eq("exercise_id", id),
          orderby: ["id.ASC"],
        }),
      ])
      return { exercise: toExercise(record), items: items.map(toItem) }
    },
    null,
    [id],
  )
}

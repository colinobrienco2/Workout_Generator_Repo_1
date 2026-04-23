"use client"

import { useMemo, useState, type ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User, HelpCircle, Timer, Wrench, BarChart3, HeartPulse, Apple } from "lucide-react"
import guidedHelpCatalog from "@/data/tips/guided-help-categories.json"
import type { ChatMessage, WeeklyStatus } from "@/lib/workout-types"
import type { GuidedHelpCategory, GuidedHelpPrompt } from "@/lib/types/guided-help"

interface CoachPanelProps {
  weeklyStatus?: WeeklyStatus | null
}

function cleanText(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? ""
}

function fallbackText(value?: string | null, fallback?: string) {
  const normalized = cleanText(value)
  return normalized || (fallback ?? "")
}

function formatPercent(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "0%"
  return `${value > 0 ? "+" : ""}${value}%`
}

function formatCalories(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "0"
  return `${value > 0 ? "+" : ""}${value}`
}

function categoryFallback(categoryId: string, weeklyStatus: WeeklyStatus) {
  switch (categoryId) {
    case "weekly_strategy":
      return `Your week is being run as a ${weeklyStatus.readiness_status.toLowerCase()}-readiness week. The plan is staying structured around ${fallbackText(weeklyStatus.progression_focus, "steady progression")} so your training matches the signals you have logged.`
    case "exercise_help":
      return `This movement fits a fixed role inside the workout. Treat it as a chance to train the target pattern with clean reps, stable positions, and the intent described in your training note: ${fallbackText(weeklyStatus.training_note, "move well and keep quality high")}.`
    case "logging_data":
      return `The system gets sharper when your logs are complete and consistent. Right now you have ${weeklyStatus.days_logged} days logged and ${weeklyStatus.workouts_completed} workouts completed, so keep building a usable trend instead of relying on one-off entries.`
    case "nutrition":
      return `Nutrition is supporting the week, not operating separately from it. Use the current calorie target as a deliberate part of the plan and pair it with the weekly note: ${fallbackText(weeklyStatus.nutrition_note, "stay consistent and avoid overreacting to short-term fluctuations")}.`
    case "recovery":
      return `Recovery is one of the main signals behind this week's setup. Your current status is ${weeklyStatus.readiness_status}, so the goal is to match effort to recovery instead of forcing a harder week than your inputs support.`
    case "program_basics":
      return `This system is deterministic on purpose. It uses fixed rules, your logged data, and the current weekly strategy to produce repeatable coaching instead of random advice.`
    default:
      return fallbackText(
        weeklyStatus.coach_notes,
        "Your current weekly data is driving a deterministic coaching response.",
      )
  }
}

function buildDeterministicResponse(
  prompt: GuidedHelpPrompt,
  categoryId: string,
  weeklyStatus?: WeeklyStatus | null,
) {
  if (!weeklyStatus) {
    return "Generate a workout first to load your weekly strategy, recovery context, and guided coaching details."
  }

  const readiness = weeklyStatus.readiness_status
  const triggerReason = fallbackText(weeklyStatus.trigger_reason, "your recent training and recovery signals")
  const progressionFocus = fallbackText(weeklyStatus.progression_focus, "steady progression")
  const volumeMode = fallbackText(weeklyStatus.volume_mode, "Maintain")
  const volumePct = formatPercent(weeklyStatus.volume_adjustment_pct)
  const dataQuality = fallbackText(weeklyStatus.data_quality_flag, "usable")
  const trainingNote = fallbackText(weeklyStatus.training_note, "keep execution clean and stay within the planned effort")
  const recoveryNote = fallbackText(weeklyStatus.recovery_note, "protect recovery so the next sessions stay productive")
  const coachNotes = fallbackText(weeklyStatus.coach_notes, "follow the current weekly structure and let the logs guide the next adjustment")
  const nutritionNote = fallbackText(weeklyStatus.nutrition_note, "keep intake consistent so recovery and performance stay supported")
  const calorieAdjustment = formatCalories(weeklyStatus.calorie_adjustment)

  switch (prompt.question_id) {
    case "why_this_week_strategy":
      return `Your week is structured this way because your current readiness is ${readiness}. The main trigger behind that call was ${triggerReason}. From there, the plan centers on ${progressionFocus}, with the weekly coaching note keeping the strategy grounded: ${coachNotes}.`
    case "why_volume_changed":
      return `Volume changed because the week is running in ${volumeMode} mode and the current adjustment is ${volumePct}. That change is tied to ${triggerReason} and your ${readiness.toLowerCase()} readiness context, so the system is trying to match workload to what your recent data supports.`
    case "why_volume_stayed_same":
      return `Volume stayed steady because the current signals do not justify a bigger push or pullback. Your readiness is ${readiness}, data quality is ${dataQuality}, and the system has enough reason to keep the week stable instead of making a reactive change.`
    case "what_is_progression_focus":
      return `Your progression focus this week is ${progressionFocus}. In practice, that means the week should be approached with repeatable execution, stable logging, and enough control that the plan can build on this week's results instead of guessing next week.`
    case "why_am_i_in_deload":
      return weeklyStatus.deload_flag
        ? `You are in a deload because the current weekly signals support reducing strain before pushing again. Readiness is ${readiness}, recovery context points to ${recoveryNote}, and the system is using the deload to preserve long-term progress instead of forcing another hard week.`
        : `You are not currently flagged for a deload week. If that changes later, it will come from readiness, recovery, and trend data showing that pulling back would improve the next training block.`
    case "what_if_i_feel_better_than_plan":
      return `If you feel better than the plan suggests, take that as a good sign without rewriting the week on impulse. The system is still following logged data such as ${triggerReason}, so the best move is usually to execute the plan cleanly, log the session well, and let next week's adjustment reflect that improved trend.`
    case "what_if_i_feel_worse_than_plan":
      return `If you feel worse than the plan suggests, keep the structure but use judgment on effort and execution quality. Stay honest in your logs, respect the planned work where possible, and let the system see that reality instead of pretending the session felt better than it did.`
    case "how_readiness_changes_week":
      return `Readiness changes how aggressive the week should be. Your current status is ${readiness}, which helps drive volume mode, influences how hard sessions should feel, and shapes the coaching emphasis around ${progressionFocus} rather than treating every week the same.`
    case "what_drives_weekly_adjustments":
      return `Weekly adjustments are driven by the pattern in your inputs, not one isolated data point. The main drivers are readiness, recovery, workout completion, days logged, data quality, and the trigger behind this week: ${triggerReason}.`
    case "how_should_i_approach_this_week":
      return `Approach this week with ${readiness.toLowerCase()}-appropriate discipline. The practical focus is ${trainingNote}. The broader coaching direction is ${coachNotes}, so the win is following the plan with clean execution and solid logging rather than chasing random extra work.`

    case "why_is_this_exercise_here":
      return `This exercise is here because it fills a specific role in the workout, not because it was picked at random. It supports the session structure, matches the deterministic template, and helps deliver the week's training goal without overlapping too much with the other work.`
    case "what_should_i_focus_on":
      return `Focus on the quality of the reps more than the appearance of effort. The priority is ${trainingNote}, which usually means staying controlled, owning the hard positions, and making the target muscles do the work instead of rushing through the set.`
    case "what_is_the_goal_of_this_exercise":
      return `The goal of this exercise is to add productive training stimulus inside the session without wasting fatigue. Depending on where it sits in the workout, that usually means either a main stimulus slot or a fatigue-efficient accessory slot that supports the bigger lifts.`
    case "why_this_order_in_workout":
      return `Exercise order is part of the coaching logic. Movements placed earlier usually need more focus, stability, or output, while later movements are there to add volume once the highest-priority work is already done.`
    case "should_i_push_or_control_reps":
      return `Default to controlled, clean reps first, then push effort inside that standard. If the rep quality drops early, the set is no longer doing its job well. This movement is most useful when effort stays connected to execution instead of turning into sloppy momentum.`
    case "what_makes_this_different":
      return `What makes this movement different is the training effect it creates inside the session. Even when it looks similar to another exercise, small changes in stability, loading pattern, or range emphasis can make it better for this slot in the plan.`
    case "how_should_this_feel":
      return `Done well, this should feel targeted rather than random. You should feel the intended muscles carrying the work, the positions should stay stable, and the reps should look repeatable instead of turning into compensations.`
    case "is_this_main_or_accessory":
      return `Treat this as a role-based movement inside the session. In this system, an exercise is "main" when it drives the session's primary stimulus and "accessory" when it supports that work with cleaner, lower-cost volume. This one is best approached as a structured support piece unless the workout clearly places it up front.`
    case "what_common_mistake_should_i_avoid":
      return `The most common mistake here is chasing reps without keeping the movement honest. Avoid speeding through the easiest range, losing tension, or changing the movement just to finish the set. Clean reps give the system better training to build from.`
    case "how_does_this_help_the_workout":
      return `This exercise helps the rest of the workout by covering a specific need in the session. It either sets up the main work, adds useful volume after it, or fills a movement pattern that keeps the whole workout balanced and productive.`

    case "how_improve_coaching_accuracy":
      return `You improve coaching accuracy by giving the system a cleaner trend to work from. Log workouts consistently, enter recovery honestly, and avoid long gaps. Deterministic coaching gets better when the inputs are complete, not when the app tries to guess around missing data.`
    case "what_counts_as_completed_workout":
      return `A completed workout should mean you actually performed the planned session in a way that reflects the training intent. It does not need to be perfect, but it should be real enough that the completion and the log tell the system this session counts as useful training.`
    case "what_does_low_data_mean":
      return `Low data means the system does not have enough reliable information to coach aggressively. Your current data quality flag is ${dataQuality}, with ${weeklyStatus.days_logged} days logged and ${weeklyStatus.workouts_completed} workouts completed, so missing or inconsistent entries can flatten how specific the recommendations become.`
    case "why_logging_consistency_matters":
      return `Logging consistency matters because the system responds to patterns. One great entry tells very little by itself, but repeated workout and recovery logs show whether the plan is working, whether readiness is stable, and whether future adjustments should change.`
    case "what_should_i_log_every_time":
      return `At a minimum, log workout completion and the weekly recovery inputs that influence readiness. Those are the core pieces that help the app judge whether the plan was followed, whether recovery is trending up or down, and whether the next recommendation should stay steady or change.`
    case "what_happens_if_i_skip_logs":
      return `If you skip logs, the system has to coach more conservatively because it loses context. That usually means weaker confidence, flatter week-to-week guidance, and fewer meaningful adjustments because the app cannot separate a real trend from missing information.`
    case "does_one_bad_entry_matter":
      return `One bad entry usually matters much less than repeated inconsistency. The system is trying to read the trend, so a single imperfect log is recoverable. The bigger problem is when low-quality entries become the pattern.`
    case "how_often_should_i_log":
      return `For best results, log each workout and keep your weekly recovery inputs current. The goal is not perfect obsessive tracking. The goal is consistent enough data that the app can see what kind of week you are actually having.`
    case "why_system_needs_my_inputs":
      return `The system needs your inputs because deterministic logic can only work with real signals, not guesses. Your readiness, completion, and recovery inputs are what let the app turn fixed rules into coaching that still feels personal.`
    case "how_do_i_get_better_recommendations":
      return `Better recommendations come from better trend quality. Complete more workouts, log them consistently, keep recovery inputs honest, and reduce missing data. That gives the app more confidence to make useful adjustments instead of generic safe ones.`

    case "why_did_calories_change":
      return weeklyStatus.calorie_adjustment !== 0
        ? `Calories changed by ${calorieAdjustment} because nutrition is being used to support the current week, not managed separately from it. That adjustment is meant to match your recent training and trend context while supporting the broader note for the week: ${nutritionNote}.`
        : `Calories did not actually change this week. When an adjustment does happen, it is tied to performance and trend context rather than made randomly.`
    case "why_did_calories_stay_same":
      return `Calories stayed the same because the current trend does not justify a reactive change. Keeping intake stable can be the right move when the system sees enough alignment between the plan, recent performance, and the pace of progress.`
    case "how_does_nutrition_support_week":
      return `Nutrition supports this week by helping recovery, performance, and consistency all stay aligned with the training plan. The point is not just hitting a number. It is making sure intake supports the kind of week you are actually running.`
    case "should_i_change_food_quality":
      return `Calories set the broad direction, but food quality affects how easy that plan is to execute. If adherence is solid, keep the calorie target stable and improve food quality where it helps appetite, recovery, and consistency rather than turning the week into a full diet overhaul.`
    case "what_if_hunger_is_high":
      return `If hunger is high, stay aligned with the plan before assuming the calories are wrong. Build meals that are easier to stick to, prioritize higher-satiety foods, and use the weekly note as your anchor: ${nutritionNote}.`
    case "what_if_appetite_is_low":
      return `If appetite is low, the main job is still consistency. Keep meals simple, avoid skipping intake just because hunger is muted, and make the week easier to execute instead of waiting to feel perfectly motivated to eat.`
    case "do_calories_affect_recovery":
      return `Yes. Calories affect recovery because under-fueling can make training feel harder to recover from and can drag down readiness over time. Intake is one of the levers that helps the training week stay sustainable.`
    case "how_should_i_think_about_adjustments":
      return `Think about calorie adjustments as strategic nudges, not emotional verdicts on the week. A change in intake is the system making a controlled correction so your nutrition keeps supporting the goal instead of drifting away from it.`
    case "what_if_scale_is_not_moving":
      return `If the scale is not moving the way you expected, zoom out before reacting. The system looks for trend direction, not one weigh-in, and nutrition changes work best when you give them enough time to show up in the data.`
    case "what_should_i_do_nutrition_this_week":
      return `Nutrition-wise, keep the current target consistent and let it support the training week you are in. The practical summary is simple: follow the calorie plan, keep food choices repeatable enough to execute, and use this note as the lens for the week: ${nutritionNote}.`

    case "how_does_recovery_affect_workout":
      return `Recovery affects how much training you can actually benefit from, not just how the workout feels. With readiness currently at ${readiness}, the system uses recovery to decide how hard the week should lean and how much volume is worth keeping in.`
    case "what_should_i_do_on_deload_week":
      return weeklyStatus.deload_flag
        ? `On a deload week, the goal is to keep training practice while reducing strain. Hit the sessions with discipline, keep the reps clean, avoid adding extra fatigue, and use the week to come back sharper for the next push.`
        : `You are not currently on a deload week. If one is triggered later, the goal will be to reduce strain on purpose, not to stop training completely.`
    case "what_does_low_recovery_change":
      return `Low recovery changes what the workout should ask from you. It can reduce how much volume is appropriate, lower how aggressive the effort should be, and shift the goal from pushing hard to getting quality work done without digging the hole deeper.`
    case "why_recovery_matters_so_much":
      return `Recovery matters because progress comes from what you can absorb, not just what you can survive. The app treats recovery as central because it helps decide whether more work will build momentum or simply create more fatigue.`
    case "what_if_i_am_sore_but_can_train":
      return `If you are sore but still able to train with good positions and stable output, that usually means the session can still be productive. The key is to distinguish normal training fatigue from soreness that changes movement quality or makes the planned effort unrealistic.`
    case "what_if_sleep_has_been_bad":
      return `If sleep has been bad lately, take it seriously because it tends to show up in readiness before it shows up in performance. Poor sleep can make the same session feel heavier, reduce recovery quality, and make a conservative week more appropriate.`
    case "can_i_push_through_low_recovery":
      return `You can sometimes get through a session with low recovery, but that does not always mean you should push it hard. The better rule is to respect the structure, keep rep quality high, and avoid turning a low-recovery week into a test of stubbornness.`
    case "how_should_i_adjust_when_tired":
      return `When you feel run down, adjust by protecting execution first. Stay within the session, keep effort honest, do not add extra work, and let the logged result show the system what your current capacity actually was.`
    case "what_is_the_goal_of_recovery_week":
      return `The goal of a lower-recovery week is to keep progress moving by reducing unnecessary strain. Sometimes the smartest way to keep momentum is to stop forcing a hard week your recovery is not ready to support.`
    case "how_can_i_support_recovery_better":
      return `Support recovery by tightening the basics that actually move the needle: sleep, food, consistency, and not overshooting effort. The weekly recovery note for you is ${recoveryNote}, so use that as the most direct coaching priority.`

    case "how_are_workouts_built":
      return `Workouts are built from fixed training structure, not generated randomly. The app uses a deterministic template, chooses exercises that fit the session role, and then layers in the weekly context so the workout stays repeatable and coachable over time.`
    case "why_isnt_this_random":
      return `This is not random because training quality improves when session structure is stable. Random novelty can feel interesting, but repeatable rules make it easier to progress, recover properly, and understand why the plan changes from week to week.`
    case "how_does_system_choose_exercises":
      return `The system chooses exercises by matching movements to the workout structure and the progression intent of the week. Selection follows rules about role, balance, and fit, so the plan stays coherent instead of becoming a pile of disconnected exercises.`
    case "why_is_structure_important":
      return `Workout structure matters because order and role change the effect of the whole session. Good structure lets the highest-priority work happen when you are freshest, then uses later slots to add useful volume without wasting fatigue.`
    case "how_does_program_stay_consistent":
      return `The program stays consistent because the same rules keep driving decisions week after week. That repeatability is what makes progress measurable and helps the coaching feel dependable instead of arbitrary.`
    case "what_makes_this_deterministic":
      return `What makes this system deterministic is that the outputs come from fixed logic plus your logged inputs. The app is not inventing advice on the fly. It is applying the same rules to the same kind of data every time.`
    case "why_not_just_generate_anything":
      return `The app does not just generate anything because novelty is not the same as coaching quality. Controlled logic is better for training outcomes because it keeps exercise selection, workload, and progression tied to a clear reason.`
    case "how_does_program_progress_over_time":
      return `The program progresses over time by looking at trend quality across weeks, then adjusting the next week with that context in mind. Your current focus is ${progressionFocus}, and future changes build from the consistency of what you log now.`
    case "what_should_i_expect_from_system":
      return `You should expect a plan that feels structured, explainable, and more useful as your logs improve. The system is designed to be dependable first, then more specific over time as it gets cleaner weekly inputs.`
    case "why_does_the_app_ask_for_data":
      return `The app asks for weekly data because that is what turns a fixed rules engine into a useful coaching product. Your inputs tell the system whether to hold steady, push, pull back, or deload instead of pretending every week should be treated the same.`
    default:
      return categoryFallback(categoryId, weeklyStatus)
  }
}

const categoryIcons: Record<string, ReactNode> = {
  weekly_strategy: <BarChart3 className="h-3.5 w-3.5" />,
  exercise_help: <HelpCircle className="h-3.5 w-3.5" />,
  logging_data: <BarChart3 className="h-3.5 w-3.5" />,
  nutrition: <Apple className="h-3.5 w-3.5" />,
  recovery: <HeartPulse className="h-3.5 w-3.5" />,
  program_basics: <Timer className="h-3.5 w-3.5" />,
}

export function CoachPanel({ weeklyStatus }: CoachPanelProps) {
  const categories = guidedHelpCatalog.categories as GuidedHelpCategory[]
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.category_id ?? "")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Choose a guided coach request below. This panel is deterministic - no free typing.",
      timestamp: new Date(),
    },
  ])

  const selectedCategory = useMemo(
    () => categories.find((category) => category.category_id === selectedCategoryId) ?? categories[0],
    [categories, selectedCategoryId],
  )

  const handlePromptClick = (prompt: GuidedHelpPrompt) => {
    const now = Date.now()
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${now}`,
        role: "user",
        content: prompt.label,
        timestamp: new Date(now),
      },
      {
        id: `assistant-${now}`,
        role: "assistant",
        content: buildDeterministicResponse(prompt, selectedCategory.category_id, weeklyStatus),
        timestamp: new Date(now + 1),
      },
    ])
  }

  return (
    <Card className="border-border/50 shadow-sm flex flex-col h-[600px]">
      <CardHeader className="pb-3 border-b border-border/50 shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-primary" />
          Coach Panel
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="shrink-0 h-8 w-8 rounded-full bg-foreground/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="px-4 py-3 border-t border-border/50 bg-muted/20 shrink-0">
          <p className="text-xs text-muted-foreground mb-2">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.category_id}
                variant={selectedCategoryId === category.category_id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategoryId(category.category_id)}
                className="gap-1.5 text-xs"
              >
                {categoryIcons[category.category_id] ?? <Wrench className="h-3.5 w-3.5" />}
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border/50 shrink-0">
          <div className="rounded-xl border border-border/60 bg-background px-3 py-3">
            <div className="text-xs font-medium text-foreground mb-2">Choose a coach request...</div>
            <div className="flex flex-wrap gap-2">
              {selectedCategory?.questions.map((prompt) => (
                <button
                  key={prompt.question_id}
                  onClick={() => handlePromptClick(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/40 hover:bg-muted transition-colors"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

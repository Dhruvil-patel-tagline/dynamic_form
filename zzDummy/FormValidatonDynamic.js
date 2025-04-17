/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createExam, updateExam } from "../../../redux/action/examActions";
import { getCookie } from "../../../utils/getCookie";
import {
  questionsErrorObj,
  teacherErrorObj,
  TOTAL_QUESTIONS,
} from "../../../utils/staticObj";
import validate, { uniqueOpt } from "../../../utils/validate";

const TeacherFormValidate = ({ isUpdateForm }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formDataState = useSelector((state) => state.formData || {});
  const {
    currentQ = 0,
    examId,
    notes = ["", ""],
    questions = Array(TOTAL_QUESTIONS)
      .fill()
      .map(() => ({
        question: "",
        answer: "",
        options: ["", "", "", ""],
      })),
    subjectName = "",
  } = formDataState.formData || {};

  const errors = {
    error: formDataState.errors?.error || teacherErrorObj,
    allQuestionError: formDataState.errors?.allQuestionError || Array(TOTAL_QUESTIONS).fill(false),
    questionsError: formDataState.errors?.questionsError || questionsErrorObj,
  };

  console.log(errors)


  const token = getCookie("authToken");

  useEffect(() => {
    if (!formDataState.formData) {
      dispatch({
        type: "SET_DATA",
        payload: {
          currentQ: 0,
          subjectName: "",
          questions: Array(TOTAL_QUESTIONS)
            .fill()
            .map(() => ({
              question: "",
              answer: "",
              options: ["", "", "", ""],
            })),
          notes: ["", ""],
        },
      });
    }

    if (!formDataState.errors) {
      dispatch({
        type: "SET_ERROR",
        payload: {
          error: teacherErrorObj,
          allQuestionError: Array(TOTAL_QUESTIONS).fill(false),
          questionsError: questionsErrorObj,
        },
      });
    }
  }, []);

  const isDuplicateQuestion = useCallback(
    (index, value) => {
      return questions.some(
        (q, i) => i !== index && q?.question?.trim() === value?.trim(),
      );
    },
    [questions],
  );

  const handleQueValidate = useCallback(
    (index) => {
      const question = questions[index];
      const errorObj = {
        questionError: "",
        answerError: "",
        optionsError: "",
      };

      if (!question?.question?.trim()) {
        errorObj.questionError = "Question cannot be empty";
      } else if (isDuplicateQuestion(index, question.question)) {
        errorObj.questionError = "Duplicate question not allowed";
      }

      if (!question?.options || !Array.isArray(question.options)) {
        errorObj.optionsError = "Invalid options format";
      } else {
        const hasEmptyOption = question.options.some((opt) => !opt?.trim());
        if (hasEmptyOption) {
          errorObj.optionsError = "4 options are required for each question";
        } else if (!uniqueOpt(question.options)) {
          errorObj.optionsError = "Same option not allowed";
        }
      }

      if (!question?.answer?.trim()) {
        errorObj.answerError = "Answer is required";
      }

      dispatch({
        type: "SET_ERROR",
        payload: { questionsError: errorObj },
      });
      return (
        !errorObj.questionError &&
        !errorObj.answerError &&
        !errorObj.optionsError
      );
    },
    [questions, isDuplicateQuestion],
  );

  const handleSubjectChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      dispatch({
        type: "SET_DATA",
        payload: { subjectName: value },
      });

      let subjectError = validate(value, name);
      dispatch({
        type: "SET_ERROR",
        payload: { error: { ...errors.error, subjectName: subjectError } },
      });
    },
    [errors.error],
  );

  const handleQuestionChange = useCallback(
    (e) => {
      const value = e.target.value;
      const updatedQuestions = [...questions];
      updatedQuestions[currentQ] = {
        ...updatedQuestions[currentQ],
        question: value
      };

      dispatch({
        type: "SET_DATA",
        payload: { questions: updatedQuestions },
      });

      let error = !value?.trim()
        ? "Question cannot be empty"
        : isDuplicateQuestion(currentQ || 0, value)
          ? "Duplicate question not allowed"
          : "";

      dispatch({
        type: "SET_ERROR",
        payload: {
          questionsError: {
            ...errors.questionsError,
            questionError: error
          }
        },
      });
    },
    [questions, currentQ, isDuplicateQuestion, errors.questionsError],
  );

  const handleAnswerChange = useCallback(
    (e) => {
      const value = e.target.value;
      const updatedQuestions = [...questions];
      updatedQuestions[currentQ] = {
        ...updatedQuestions[currentQ],
        answer: value
      };
      dispatch({
        type: "SET_DATA",
        payload: { questions: updatedQuestions },
      });
      let error = validate("Answer", value);
      dispatch({
        type: "SET_ERROR",
        payload: {
          questionsError: { ...errors.questionsError, answerError: error },
        },
      });
    },
    [currentQ, errors.questionsError, questions],
  );

  const handelOptionChange = useCallback(
    (e, idx) => {
      const value = e.target.value;
      const updatedQuestions = [...questions];
      updatedQuestions[currentQ] = {
        ...updatedQuestions[currentQ],
        options: updatedQuestions[currentQ].options.map((opt, i) =>
          i === idx ? value : opt
        ),
        answer: "" 
      };

      dispatch({
        type: "SET_DATA",
        payload: { questions: updatedQuestions },
      });

      let error = !value?.trim()
        ? "Option can not be empty"
        : !uniqueOpt(updatedQuestions[currentQ].options)
          ? "Same option not allowed"
          : "";

      dispatch({
        type: "SET_ERROR",
        payload: {
          questionsError: { ...errors.questionsError, optionsError: error },
        },
      });
    },
    [currentQ, errors.questionsError, questions],
  );

  const handleNoteChange = useCallback(
    (e, idx) => {
      const value = e.target.value;
      const updatedNotes = [...notes];
      updatedNotes[idx] = value;
      dispatch({
        type: "SET_DATA",
        payload: { notes: updatedNotes },
      });
      let noteError = validate("Note", value);
      dispatch({
        type: "SET_ERROR",
        payload: { error: { ...errors.error, note0: noteError } },
      });
    },
    [errors.error, notes],
  );

  const handleQuestionSave = useCallback(
    (index, page) => {
      let allQue;
      if (handleQueValidate(index)) {
        allQue = errors.allQuestionError.map((val, arrIndex) =>
          arrIndex === index ? true : val,
        );
        dispatch({
          type: "SET_ERROR",
          payload: {
            allQuestionError: allQue,
          },
        });

        if (page) {
          dispatch({
            type: "SET_DATA",
            payload: { currentQ: page === "previous" ? currentQ - 1 : currentQ + 1 },
          });
        }
      } else {
        allQue = errors.allQuestionError.map((val, arrIndex) =>
          arrIndex === index ? false : val,
        );
        dispatch({
          type: "SET_ERROR",
          payload: {
            allQuestionError: allQue,
          },
        });
      }
      if (allQue) {
        if (allQue.every((val) => val)) {
          dispatch({
            type: "SET_ERROR",
            payload: { error: { ...errors.error, queError: null } },
          });
        }
      }
      return allQue;
    },
    [errors.allQuestionError, currentQ, handleQueValidate, errors.error],
  );

  const customValidation = () => {
    let result = handleQuestionSave(currentQ);
    const errorObj = { error: {}, allQuestionsError: {}, questionsError: {} };

    if (!subjectName?.trim()) {
      errorObj.error.subjectName = "Subject name is required";
    }

    const currentQuestion = questions[currentQ];
    if (!currentQuestion?.question?.trim()) {
      errorObj.questionsError.questionError = "Question cannot be empty";
    } else if (isDuplicateQuestion(currentQ, currentQuestion.question)) {
      errorObj.questionsError.questionError = "Duplicate question not allowed";
    }

    const hasEmptyOption = currentQuestion?.options?.some((opt) => !opt?.trim());
    if (hasEmptyOption) {
      errorObj.questionsError.optionsError =
        "4 options are required for each question";
    } else if (currentQuestion?.options && !uniqueOpt(currentQuestion.options)) {
      errorObj.questionsError.optionsError = "Same option not allowed";
    }

    if (!currentQuestion?.answer?.trim()) {
      errorObj.questionsError.answerError = "Answer is required";
    }

    if (!notes?.every((note) => note?.trim())) {
      errorObj.error.note0 = "Notes are required";
    } else if (notes[0]?.trim() === notes[1]?.trim()) {
      errorObj.error.note0 = "Notes can not be same";
    }

    if (result && !result.every((val) => val)) {
      errorObj.allQuestionsError = "all 15 question are required";
    }

    if (Object.keys(errorObj).length > 0) {
      // dispatch(({
      //   type: "SET_ERROR",
      //   payload: { ...errors.error }
      // }))
      dispatch(({
        type: "SET_ERROR",
        payload: { error: errorObj.error }
      }))
      dispatch(({
        type: "SET_ERROR",
        payload: { questionError: errorObj.questionsError }
      }))
      // if (errorObj.error.subjectName) {
      //   dispatch({
      //     type: "SET_ERROR",
      //     payload: {
      //       error: { ...errors.error, subjectError: errorObj.subjectName },
      //     },
      //   });
      // }

      // dispatch({
      //   type: "SET_ERROR",
      //   payload: {
      //     questionsError: {
      //       questionError: errorObj[`question-${currentQ}`] || "",
      //       optionsError: errorObj[`option-${currentQ}-0`] || "",
      //       answerError: errorObj[`answer-${currentQ}`] || "",
      //     },
      //   },
      // });

      // if (errorObj.note0) {
      //   dispatch({
      //     type: "SET_ERROR",
      //     payload: {
      //       error: { ...errors.error, noteError: errorObj.note0 },
      //     },
      //   });
      // }
    }
    return errorObj;
  };

  const handleSubmit = () => {
    if (isUpdateForm) {
      dispatch(
        updateExam({ subjectName, questions, notes }, examId, token, navigate),
      );
    } else {
      dispatch(createExam({ subjectName, questions, notes }, token, navigate));
    }
  };

  const resetForm = () => {
    dispatch({
      type: "SET_DATA",
      payload: {
        subjectName: "",
        questions: Array(TOTAL_QUESTIONS)
          .fill()
          .map(() => ({
            question: "",
            answer: "",
            options: ["", "", "", ""],
          })),
        notes: ["", ""],
        currentQ: 0,
      },
    });

    dispatch({
      type: "SET_ERROR",
      payload: {
        questionsError: questionsErrorObj,
        allQuestionError: Array(TOTAL_QUESTIONS).fill(false),
        error: teacherErrorObj,
      },
    });
  };

  useEffect(() => {
    if (examId) {
      dispatch({
        type: "SET_ERROR",
        payload: { allQuestionError: Array(TOTAL_QUESTIONS).fill(true) },
      });
    }
  }, [examId]);

  const formFields = useMemo(() => {
    const currentQuestion = questions[currentQ] || {
      question: "",
      answer: "",
      options: ["", "", "", ""],
    };
    return [
      {
        id: "subjectName",
        type: "text",
        name: "Subject Name",
        input: "input",
        placeholder: "Subject Name",
        value: subjectName,
        error: errors?.error?.subjectName,
        onChange: (e) => {
          handleSubjectChange(e);
        },
      },
      {
        id: `question-${currentQ}`,
        type: "text",
        name: `Question: ${currentQ + 1} / ${TOTAL_QUESTIONS}`,
        input: "input",
        placeholder: "Enter question",
        value: currentQuestion.question || "",
        error: errors.questionsError?.questionError || "",
        onChange: (e) => {
          handleQuestionChange(e);
        },
      },
      ...(currentQuestion.options || []).map((opt, idx) => ({
        id: `option-${currentQ}-${idx}`,
        type: "text",
        name: `Options`,
        input: "input",
        placeholder: `Option ${idx + 1}`,
        value: opt || "",
        error: errors.questionsError?.optionsError || "",
        noText: true,
        onChange: (e) => {
          handelOptionChange(e, idx);
        },
      })),
      {
        id: `answer-${currentQ}`,
        type: "radio",
        name: "Answer",
        noLabel: true,
        input: "radio",
        options:
          (currentQuestion.options || []).filter((opt) => opt?.trim() !== "") || [],
        value: currentQuestion.answer || "",
        error: errors.questionsError?.answerError || "",
        onChange: (e) => {
          handleAnswerChange(e);
        },
        className: "radio-com",
      },
      {
        id: "previous",
        type: "button",
        name: "Previous",
        input: "button",
        noText: true,
        onClick: () => {
          handleQuestionSave(currentQ, "previous");
        },
        disabled: currentQ === 0,
      },
      {
        type: "button",
        noText: true,
        onClick: () => {
          handleQuestionSave(currentQ, "next");
        },
        disabled: currentQ === TOTAL_QUESTIONS - 1,
        name: "Next",
        input: "button",
        id: "next",
        className: "next-btn-div",
      },
      ...(notes || ["", ""]).map((note, idx) => ({
        id: `note-${idx}`,
        type: "text",
        name: `Notes`,
        input: "input",
        placeholder: `Note ${idx + 1}`,
        value: note || "",
        error: errors?.error?.note0 || "",
        noText: true,
        onChange: (e) => {
          handleNoteChange(e, idx);
        },
      })),
    ];
  }, [
    questions,
    currentQ,
    subjectName,
    errors,
    notes,
    handleSubjectChange,
    handleQuestionChange,
    handelOptionChange,
    handleAnswerChange,
    handleQuestionSave,
    handleNoteChange,
  ]);

  return {
    customValidation,
    handleSubmit,
    resetForm,
    formData: formDataState,
    formFields,
  };
};

export default TeacherFormValidate;

import { Router} from "express";
import { db } from "../utils/db.js";
import { ObjectId } from "mongodb";

const questionRouter = Router();

questionRouter.get("/", async (req, res) => {
  const collection = db.collection("questions");
  const newCategory = req.query.category;
  const findTitle = req.query.keywords;

  const newQuery = {};

  if (newCategory) {
    newQuery.category = newCategory;
  }

  if (findTitle) {
    newQuery.title = new RegExp(findTitle, "i");
  }

  try {
    const questions = await collection
      .find(newQuery)
      .sort({ created_at: -1 })
      .toArray();
    return res.status(200).json({
      data: questions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "fail : " + error,
    });
  }
});

questionRouter.get("/:id", async (req, res) => {
  const collection = db.collection("questions");
  try {
    const questionId = new ObjectId(req.params.id);
    const questions = await collection.find({ _id: questionId }).toArray();
    return res.status(200).json({
      data: questions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "fail : " + error,
    });
  }
});

questionRouter.post("/", async (req, res) => {
  const collection = db.collection("questions");

  try {
    await collection.insertOne({
      ...req.body,
      like:0,
      created_at: new Date(),
    });
    return res.status(200).json({
      message: "question has been added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "fail : " + error,
    });
  }
});

questionRouter.put("/:id", async (req, res) => {
  const collection = db.collection("questions");
  const questionsId = new ObjectId(req.params.id);
  const addLike = req.query.like;
  const disLike = req.query.disLike;
  let newQuestionsData = {};
  let resMessage = ""

  if(addLike || disLike){
    newQuestionsData = await collection.findOne({ _id: questionsId });
    if(addLike){
      newQuestionsData.like += 1
      resMessage = "You like this question";
    }
    if (disLike) {
      newQuestionsData.like -= 1;
      resMessage = "You dislike this question";
    }    
  }else{
    newQuestionsData = { ...req.body }; 
    resMessage = "Question has been updated successfully";
  }

  try {
    await collection.updateOne(
      { _id: questionsId },
      { $set: newQuestionsData }
    );
    return res.status(200).json({
      message: resMessage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "fail : " + error,
    });
  }
});

questionRouter.delete("/:id", async (req, res) => {
  const collectionQuestions = db.collection("questions");
  const collectionAnswers = db.collection("answers");
  try {
    const questionsId = new ObjectId(req.params.id);
    await collectionQuestions.deleteOne({ _id: questionsId });
    await collectionAnswers.deleteMany({ questionsId: questionsId });
    return res.status(200).json({
      message: "questions has been delete successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "fail : " + error,
    });
  }
});

questionRouter.post("/:id/answer", async (req, res) => {
  const collection = db.collection("answers");
  const questionsId = new ObjectId(req.params.id);
  const answerString = {...req.body}

  if(answerString.length > 30){
    return res.status(500).json({
      message: "fail : The character length should not exceed 300 characters.",
    });    
  }

  try {
    await collection.insertOne({
      questionsId: questionsId,
      ...req.body,
      like:0,
      created_at: new Date(),
    });
    return res.status(200).json({
      message: "answer has been created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "fail : " + error,
    });
  }
});

questionRouter.get("/:id/answer", async (req, res) => {
  const collection = db.collection("answers");
  try {
    const questionId = new ObjectId(req.params.id);
    const answers = await collection
      .find({ questionsId: questionId })
      .toArray();
    return res.status(200).json({
      data: answers,
    });
  } catch (error) {
    return res.status(500).json({
      message: "fail : " + error,
    });
  }
});

questionRouter.put("/:id/answer/:ansId", async (req, res) => {
  const collection = db.collection("answers");
  const ansId = new ObjectId(req.params.ansId);
  const addLike = req.query.like;
  const disLike = req.query.disLike;
  let newAnsData = {};
  let resMessage = "";

  if (addLike || disLike) {
    newAnsData = await collection.findOne({ _id: ansId });
    if (addLike) {
      newAnsData.like += 1;
      resMessage = "You like this question";
    }
    if (disLike) {
      newAnsData.like -= 1;
      resMessage = "You dislike this question";
    }
  } else {
    newAnsData = { ...req.body };
    resMessage = "Question has been updated successfully";
  }

  try {
    await collection.updateOne({ _id: ansId }, { $set: newAnsData });
    return res.status(200).json({
      message: resMessage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "fail : " + error,
    });
  }
});


export default questionRouter;


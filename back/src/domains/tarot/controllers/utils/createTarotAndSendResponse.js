const { tarotService } = require("../../services");

async function createTarotAndSendResponse(
  inputQuestionData,
  interpretation,
  type,
  userInfo,
  res,
  session = null
) {
  const timeOfCounselling = inputQuestionData?.time;
  const newTarotInfo = {
    ...inputQuestionData,
    answer: interpretation,
    type: type,
    userInfo,
    timeOfCounselling,
  };
  const newTarot = await tarotService.createTarot(newTarotInfo, session);

  if (!newTarot) {
    throw new Error("Failed to create tarot reading");
  }

  const {
    questionInfo,
    spreadInfo,
    answer,
    language,
    createdAt,
    updatedAt,
    ...rest
  } = newTarot;

  // & 즉각적인 답이 필요하니 post에 결과 전송
  res.status(200).json({
    questionInfo,
    spreadInfo,
    answer,
    language,
    createdAt,
    updatedAt,
    timeOfCounselling,
  });
}

module.exports = createTarotAndSendResponse;

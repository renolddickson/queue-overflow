import { Article } from "@/types";

export const articleData: Article = {
    meta: {
      publishDate: "15/11/2023",
    },
    title: "Platform overview/ What is Playcart?",
    content:[
      {
        type:'heading2',
        content:{
          data:"Heading 2"
        }
      },
      {
        type:"paragraph",
        content:{
          data:"Intro text l leo risus, porta ac consectetur ac, vestibulum at eros. Nullam quis risus eget urna mollis ornare vel eu leo. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit."
        }
      },
      {
        type:"quote",
        content:{
          config:{
            author:"venkat"
          },
          data:"never distrubt me in my notification ."
        }
      },
      {
        type:'warningBox',
        content:{
          config:{
            type:'info',
            design: 2
          },
          data:"If you don't have a Copilot subscription yet, use Copilot for free by signing up for the Copilot Free plan. You'll get a monthly limit of completions and chat interactions."
        }
      },
      {
        type:"codeBlock",
        content:{
          config:{
            language:'python'
          },
          data:"print('hello')"
        }
      }
    ],
    routeTopic:{
      next:{
        id:"",
        title:"Intro"
      },
      previous:{
        id:"",
        title:"setup"
      }
    },
    relatedArticles: [{id:"1",title:"Another Related Article 1"}, {id:"2",title:"Another Related Article 2"}, {id:"3",title:"Another Related Article 3"}],
  }
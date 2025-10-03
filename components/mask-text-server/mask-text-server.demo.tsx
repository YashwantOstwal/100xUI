import { MaskTextServer } from "./mask-text-server";

export function MaskTextServerDemo() {
  return (
    <div className="box-content flex max-w-md flex-col px-5">
      <MaskTextServer.ByLines
        render={() => ({
          "0px":
            "Lorem ipsum dolor sit\namet, consectetur\nadipisicing elit.\nNecessitatibus fugiat\nquidem tenetur\nconsequatur, placeat\npossimus ducimus qui\nnatus optio vel!",
          "375px":
            "Lorem ipsum dolor sit amet,\nconsectetur adipisicing elit.\nNecessitatibus fugiat quidem\ntenetur consequatur, placeat\npossimus ducimus qui natus optio\nvel!",
          "532px":
            "Lorem ipsum dolor sit amet, consectetur adipisicing\nelit. Necessitatibus fugiat quidem tenetur consequatur,\nplaceat possimus ducimus qui natus optio vel!",
        })}
      />
      <MaskTextServer.ByWords
        className="mt-5"
        render={() =>
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Necessitatibus fugiat quidem tenetur consequatur, placeat possimus ducimus qui natus optio vel!"
        }
        textAlign="left"
      />

      <MaskTextServer.ByLetters
        className="mt-5"
        render={() =>
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Necessitatibus fugiat quidem tenetur consequatur, placeat possimus ducimus qui natus optio vel!"
        }
      />
    </div>
  );
}
